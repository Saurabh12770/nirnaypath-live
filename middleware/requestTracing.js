'use strict';

/**
 * NirnayPath — End-to-End Request Tracing & Correlation Middleware (Phase 11 — Module E)
 * ====================================================================================
 * Generates and propagates standard 'x-correlation-id' across requests and async hops.
 * Uses Node's AsyncLocalStorage to keep trace context accessible from downstream loggers,
 * db queries, and error reporters without passing it in function arguments.
 *
 * Header behavior:
 *   - Client sends 'x-correlation-id' or 'x-trace-id': preserve it to support tracing across gateways.
 *   - Otherwise: generate a fresh high-entropy UUID.
 *   - Always returned in client response headers.
 */

const { AsyncLocalStorage } = require('async_hooks');
const crypto = require('crypto');
const { recordRequest } = require('../utils/telemetryStore');

// Global AsyncLocalStorage context
const traceContext = new AsyncLocalStorage();

/**
 * Express middleware for request tracing.
 */
function requestTracer(req, res, next) {
    const correlationId = req.headers['x-correlation-id'] || 
                          req.headers['x-trace-id'] || 
                          crypto.randomUUID();

    // Set header on response so clients can reference it
    res.setHeader('x-correlation-id', correlationId);

    // Bind request context
    const context = {
        correlationId,
        startTime: Date.now(),
        path:      req.path,
        method:    req.method
    };

    traceContext.run(context, () => {
        // Auto-record every completed request into the shared telemetry store
        res.on('finish', () => {
            const durationMs = Date.now() - context.startTime;
            recordRequest({
                url:        req.path,
                method:     req.method,
                status:     res.statusCode,
                durationMs
            });
        });
        next();
    });
}

/**
 * Helper to retrieve the current request's Correlation ID.
 * Returns null if executed outside of an active HTTP request trace context.
 */
function getCorrelationId() {
    const store = traceContext.getStore();
    return store ? store.correlationId : null;
}

/**
 * Helper to get the complete current request context.
 */
function getTraceContext() {
    return traceContext.getStore() || null;
}

module.exports = {
    requestTracer,
    getCorrelationId,
    getTraceContext,
    traceContext
};
