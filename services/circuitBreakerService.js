/**
 * Circuit Breaker Service
 * Phase 7 - Enterprise Certification
 */

const RuntimeSupervisorService = require('./runtimeSupervisorService');

class CircuitBreakerService {
    static circuits = new Map();

    static getCircuit(name) {
        if (!this.circuits.has(name)) {
            this.circuits.set(name, {
                state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
                failures: 0,
                lastFailureTime: null,
                failureThreshold: 5,
                cooldownPeriodMs: 30000 // 30 seconds
            });
        }
        return this.circuits.get(name);
    }

    static async wrapOperation(name, fn, fallbackFn = null) {
        const circuit = this.getCircuit(name);

        if (circuit.state === 'OPEN') {
            if (Date.now() - circuit.lastFailureTime > circuit.cooldownPeriodMs) {
                // Enter half-open mode
                circuit.state = 'HALF_OPEN';
                RuntimeSupervisorService.logTrace({ type: 'CIRCUIT_HALF_OPEN', source: name });
            } else {
                if (fallbackFn) return fallbackFn();
                throw new Error(`Circuit Breaker OPEN for ${name}`);
            }
        }

        try {
            const result = await fn();
            
            if (circuit.state === 'HALF_OPEN') {
                circuit.state = 'CLOSED';
                circuit.failures = 0;
                RuntimeSupervisorService.logTrace({ type: 'CIRCUIT_CLOSED', source: name });
            }
            
            return result;
        } catch (error) {
            circuit.failures++;
            circuit.lastFailureTime = Date.now();

            if (circuit.failures >= circuit.failureThreshold || circuit.state === 'HALF_OPEN') {
                circuit.state = 'OPEN';
                RuntimeSupervisorService.logTrace({ type: 'CIRCUIT_OPEN', source: name, reason: error.message });
            }

            if (fallbackFn) return fallbackFn();
            throw error;
        }
    }
}

module.exports = CircuitBreakerService;
