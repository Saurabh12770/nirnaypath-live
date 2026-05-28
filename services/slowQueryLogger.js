'use strict';

/**
 * NirnayPath — Global Mongoose Slow Query Logger Plugin (Phase 11 — Module E)
 * =========================================================================
 * Integrates directly into Mongoose as a global plugin.
 * Tracks ALL query executions, measures actual database round-trip times,
 * and automatically logs queries exceeding SLOW_QUERY_THRESHOLD_MS.
 *
 * Correlation Tracing:
 *   - Automatically pulls the active correlationId from RequestTracing context
 *     to tie slow queries back to the originating HTTP request/route.
 */

const logger = require('../utils/logger');
const { getCorrelationId } = require('../middleware/requestTracing');
const QueryProfiler = require('./queryProfiler');

const SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '100');

function slowQueryLoggerPlugin(schema, options = {}) {
    // List of Mongoose query methods to profile
    const queryMethods = [
        'find',
        'findOne',
        'findOneAndUpdate',
        'findOneAndDelete',
        'updateOne',
        'updateMany',
        'deleteOne',
        'deleteMany',
        'countDocuments',
        'aggregate'
    ];

    queryMethods.forEach(method => {
        // pre-hook: capture start time
        schema.pre(method, function(next) {
            this._queryStartMs = Date.now();
            if (typeof next === 'function') next();
        });

        // post-hook: measure, profile and log if slow
        schema.post(method, function(res, next) {
            if (this._queryStartMs) {
                const elapsedMs = Date.now() - this._queryStartMs;
                const collectionName = this.model ? this.model.modelName : 'UnknownCollection';
                const filter = this.getQuery ? this.getQuery() : {};
                const correlationId = getCorrelationId();

                // Profile inside the QueryProfiler rolling window for deep analysis
                const profKey = `${collectionName}.${method}`;
                if (!QueryProfiler._samples.has(profKey)) {
                    QueryProfiler._samples.set(profKey, []);
                }
                const arr = QueryProfiler._samples.get(profKey);
                arr.push(elapsedMs);
                if (arr.length > 2000) arr.shift();
                QueryProfiler._callCounts.set(profKey, (QueryProfiler._callCounts.get(profKey) || 0) + 1);

                if (elapsedMs >= SLOW_THRESHOLD_MS) {
                    const record = {
                        collection: collectionName,
                        operation:  method,
                        latencyMs:   elapsedMs,
                        correlationId,
                        filter:     JSON.stringify(filter).slice(0, 500),
                        timestamp:  new Date().toISOString()
                    };

                    const telemetryEngine = require('./productionTelemetryEngine');
                    telemetryEngine.recordSlowQuery(collectionName, method, elapsedMs, filter);

                    QueryProfiler._slowQueries.push(record);
                    if (QueryProfiler._slowQueries.length > 500) {
                        QueryProfiler._slowQueries.shift();
                    }

                    logger.warn(`[SLOW-QUERY-LOGGER] DB query ${collectionName}.${method} took ${elapsedMs}ms [CorrelationID: ${correlationId || 'N/A'}]`, record);
                }
            }
            if (typeof next === 'function') next();
        });
    });
}

/**
 * Register slow query logging globally with Mongoose.
 */
function registerGlobalQueryLogger(mongooseInstance) {
    mongooseInstance.plugin(slowQueryLoggerPlugin);
    logger.info(`[SLOW-QUERY-LOGGER] Registered global query profiling. Threshold: ${SLOW_THRESHOLD_MS}ms`);
}

module.exports = {
    slowQueryLoggerPlugin,
    registerGlobalQueryLogger
};
