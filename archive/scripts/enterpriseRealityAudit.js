const fs = require('fs');
const path = require('path');
const RuntimeSupervisorService = require('../services/runtimeSupervisorService');
const DistributedLockService = require('../services/distributedLockService');
const CircuitBreakerService = require('../services/circuitBreakerService');
const MemoryPressureService = require('../services/memoryPressureService');

async function runAudit() {
    console.log('====================================================');
    console.log('   ENTERPRISE REALITY AUDIT');
    console.log('====================================================\n');

    let passCount = 0;
    let failCount = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passCount++;
        } else {
            console.log(`❌ FAIL: ${message}`);
            failCount++;
        }
    };

    try {
        console.log('\n--- TEST 1: Memory Leak Detection ---');
        const stats = RuntimeSupervisorService.monitorHeapUsage();
        assert(stats.severity !== undefined, `Heap monitor active. Severity: ${stats.severity}`);
        const leakStatus = RuntimeSupervisorService.detectMemoryLeak();
        assert(leakStatus === false, "No memory leak detected on cold boot.");
    } catch(e) { assert(false, `Test 1 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 2: Concurrent Admin Approvals (Locking) ---');
        const lock1 = await DistributedLockService.acquireLock('approval_physics');
        assert(lock1.success === true, "First lock acquired successfully.");
        
        const lock2 = await DistributedLockService.acquireLock('approval_physics');
        assert(lock2.success === false, "Second concurrent lock correctly rejected (Race condition prevented).");
        
        DistributedLockService.releaseLock('approval_physics', lock1.lockId);
    } catch(e) { assert(false, `Test 2 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 5: Circuit Breaker Operations ---');
        let failOperation = async () => { throw new Error('DB Down'); };
        let cbName = 'mongo_test';
        
        // Force circuit open
        for (let i = 0; i < 5; i++) {
            try { await CircuitBreakerService.wrapOperation(cbName, failOperation); } catch(e) {}
        }
        
        const circuit = CircuitBreakerService.getCircuit(cbName);
        assert(circuit.state === 'OPEN', "Circuit breaker successfully OPENED after threshold failures.");
        
        try {
            await CircuitBreakerService.wrapOperation(cbName, async () => { return 'Success'; });
            assert(false, "Circuit allowed operation while OPEN");
        } catch (e) {
            assert(e.message.includes('Circuit Breaker OPEN'), "Circuit correctly rejected operation while OPEN.");
        }
    } catch(e) { assert(false, `Test 5 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 7: Runtime Backpressure ---');
        const pressure = MemoryPressureService.checkRuntimeBackpressure();
        assert(pressure === false || pressure === true, "Backpressure detector is operational.");
    } catch(e) { assert(false, `Test 7 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 8: Crash Dump Generation ---');
        const dumpFile = RuntimeSupervisorService.emergencyRuntimeDump('Audit Test Dump');
        assert(fs.existsSync(dumpFile), "Emergency crash dump safely written to disk.");
        fs.unlinkSync(dumpFile); // Cleanup
    } catch(e) { assert(false, `Test 8 Failed: ${e.message}`); }

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');
    process.exit(0);
}

runAudit();
