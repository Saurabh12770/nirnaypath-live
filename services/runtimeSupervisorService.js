/**
 * Runtime Supervisor Service
 * Phase 7 - Enterprise Certification
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const LOGS_DIR = path.join(__dirname, '../logs');

class RuntimeSupervisorService {
    static state = {
        leakWarnings: 0,
        lastHeapUsed: 0,
        eventLoopLag: 0
    };

    static logTrace(entry) {
        try {
            const traceFile = path.join(LOGS_DIR, 'runtime_supervisor_trace.json');
            fs.appendFileSync(traceFile, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n');
        } catch (e) {
            console.error('[SupervisorTrace] Error:', e.message);
        }
    }

    /**
     * 1. Monitor Heap Usage
     */
    static monitorHeapUsage() {
        const mem = process.memoryUsage();
        const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
        const rssMB = Math.round(mem.rss / 1024 / 1024);
        
        const usageRatio = mem.heapUsed / mem.heapTotal;
        let severity = 'NORMAL';
        
        if (usageRatio > 0.85) severity = 'CRITICAL';
        else if (usageRatio > 0.70) severity = 'WARNING';

        if (severity !== 'NORMAL') {
            this.logTrace({
                type: 'MEMORY_PRESSURE',
                severity,
                heapUsedMB,
                heapTotalMB,
                rssMB
            });
        }

        return { severity, heapUsedMB, heapTotalMB, rssMB, usageRatio };
    }

    /**
     * 2. Monitor Event Loop Lag
     */
    static checkEventLoopLag() {
        return new Promise(resolve => {
            const start = performance.now();
            setTimeout(() => {
                const lag = performance.now() - start - 0; // 0ms timeout
                this.state.eventLoopLag = lag;
                resolve(lag);
            }, 0);
        });
    }

    /**
     * 4. Detect Memory Leak (trend based)
     */
    static detectMemoryLeak() {
        const currentHeap = process.memoryUsage().heapUsed;
        if (currentHeap > this.state.lastHeapUsed * 1.1 && this.state.lastHeapUsed > 0) {
            this.state.leakWarnings++;
        } else if (currentHeap < this.state.lastHeapUsed) {
            this.state.leakWarnings = Math.max(0, this.state.leakWarnings - 1);
        }
        
        this.state.lastHeapUsed = currentHeap;
        
        if (this.state.leakWarnings >= 5) {
            this.logTrace({ type: 'MEMORY_LEAK_DETECTED', severity: 'CRITICAL', currentHeapMB: Math.round(currentHeap / 1024 / 1024) });
            return true;
        }
        return false;
    }

    /**
     * 5. Emergency Runtime Dump
     */
    static emergencyRuntimeDump(reason) {
        const dumpId = `runtime_dump_${Date.now()}`;
        const dumpFile = path.join(LOGS_DIR, `${dumpId}.json`);
        
        const dumpData = {
            reason,
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            uptime: process.uptime(),
            pid: process.pid,
            arch: process.arch,
            platform: process.platform,
            eventLoopLag: this.state.eventLoopLag
        };

        try {
            fs.writeFileSync(dumpFile, JSON.stringify(dumpData, null, 2));
            this.logTrace({ type: 'EMERGENCY_DUMP', severity: 'CRITICAL', file: dumpFile, reason });
            return dumpFile;
        } catch (e) {
            console.error('Failed to create emergency dump:', e);
            return null;
        }
    }
}

module.exports = RuntimeSupervisorService;
