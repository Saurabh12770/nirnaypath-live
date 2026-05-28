/**
 * SRE Crash Reporting & Incident Capture Service (Phase 9 — Production Hardened)
 * ==============================================================================
 * Centralized error reporting service for NirnayPath that manages:
 *  - Sentry Integration (via SENTRY_DSN) if enabled and dependencies are resolved
 *  - Fallback local incident registry (logs/crash_dumps.json) with rotation bounds
 *  - Capturing uncaught exceptions & unhandled rejections
 *  - Auditing payment failures, webhook crashes, database disconnects
 *  - Graceful degradation (never blocks requests or crashes boot if Sentry is down)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const CRASH_DUMP_FILE = path.join(LOG_DIR, 'crash_dumps.json');
let sentryClient = null;
let isSentryEnabled = false;

class CrashReportingService {
    
    /**
     * Initialize crash reporting on application boot
     * @param {object} app Express application instance
     */
    static init(app = null) {
        const dsn = process.env.SENTRY_DSN;
        
        if (dsn) {
            try {
                // Graceful dynamic require to prevent crash if @sentry/node is not installed
                const Sentry = require('@sentry/node');
                
                const release = process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0';
                const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'production';

                Sentry.init({
                    dsn: dsn,
                    release: release,
                    environment: environment,
                    // HS-4 FIX: Never sample 100% in production — billing risk + latency overhead.
                    // Set SENTRY_TRACES_RATE env var to override (e.g. 0.05 for 5%).
                    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_RATE || '0.1'),
                });
                
                sentryClient = Sentry;
                isSentryEnabled = true;
                logger.info(`[SENTRY] Initialized successfully in production environment. Release: ${release}, Env: ${environment}`);

                // Startup verification message
                Sentry.captureMessage('[BOOT] NirnayPath Platform v1.0.0 Online', 'info');

                if (app) {
                    // Sentry Request Handler must be the first middleware
                    app.use(Sentry.Handlers.requestHandler());
                    // Sentry Tracing Handler
                    app.use(Sentry.Handlers.tracingHandler());
                }
            } catch (err) {
                logger.warn(`[SENTRY] Failed to load Sentry library: ${err.message}. Gracefully falling back to local SRE logging.`);
            }
        } else {
            logger.info('[SENTRY] No SENTRY_DSN set. Operating in local-only SRE crash reporting mode.');
        }

        // Centralized global handler attachment
        this.setupGlobalHandlers();
    }

    /**
     * Set up Sentry Error Handler on Express App
     * Note: This must be registered AFTER routes but BEFORE general error middleware.
     * @param {object} app Express application instance
     */
    static registerErrorHandler(app) {
        if (isSentryEnabled && sentryClient) {
            app.use(sentryClient.Handlers.errorHandler());
            logger.info('[SENTRY] Express error handler middleware registered.');
        }
    }

    /**
     * Capture an exception safely, dispatching to Sentry and registering local SRE dump
     * 
     * @param {Error} err Exception object
     * @param {object} context Extra context keys (request headers, query, tags, category)
     */
    static captureException(err, context = {}) {
        const timestamp = new Date().toISOString();
        const category = context.category || 'general_crash';
        
        // 1. Structured Logging Trace
        logger.error(`[CRASH][${category.toUpperCase()}] Captured Exception: ${err.message}`, {
            category,
            error: err,
            ...context
        });

        // 2. Dispatch to Sentry if available
        if (isSentryEnabled && sentryClient) {
            try {
                sentryClient.captureException(err, {
                    tags: { category, env: process.env.NODE_ENV },
                    extra: context
                });
            } catch (sentryErr) {
                logger.error(`[SENTRY] Failed to capture exception on remote Sentry: ${sentryErr.message}`);
            }
        }

        // Telemetry integration
        try {
            const telemetryEngine = require('./productionTelemetryEngine');
            telemetryEngine.recordError(err.message, err.code || 'CRASH_ERROR', { category, ...context });
        } catch (_) {}

        // 3. Local SRE Crash Dump Registry (Zero-Trust Resilience)
        try {
            const dumpData = {
                timestamp,
                category,
                message: err.message,
                stack: err.stack,
                code: err.code || null,
                context
            };

            // Read existing dumps, keep limit to last 100 entries to prevent infinite growth
            let dumps = [];
            if (fs.existsSync(CRASH_DUMP_FILE)) {
                try {
                    const data = fs.readFileSync(CRASH_DUMP_FILE, 'utf8');
                    dumps = JSON.parse(data || '[]');
                } catch (_) {
                    dumps = [];
                }
            }

            dumps.unshift(dumpData); // newest first
            dumps = dumps.slice(0, 100); // capped at 100 entries

            const dir = path.dirname(CRASH_DUMP_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(CRASH_DUMP_FILE, JSON.stringify(dumps, null, 2), 'utf8');
        } catch (dumpErr) {
            console.error(`[LOGGER_CRASH_FATAL] Failed to write crash dump to disk: ${dumpErr.message}`);
        }
    }

    /**
     * Capture general messages or non-fatal incidents
     */
    static captureMessage(message, level = 'info', context = {}) {
        logger.info(`[INCIDENT][${level.toUpperCase()}] ${message}`, context);

        if (isSentryEnabled && sentryClient) {
            try {
                sentryClient.captureMessage(message, {
                    level: level,
                    extra: context
                });
            } catch (_) {}
        }
    }

    /**
     * Standard SRE global hooks for uncaught exceptions and unhandled rejections
     */
    static setupGlobalHandlers() {
        // Prevent duplicate handler registration
        if (global.__crashHandlersBound) return;
        global.__crashHandlersBound = true;

        process.on('uncaughtException', (err) => {
            // Log it
            this.captureException(err, { category: 'uncaught_exception', fatal: true });
            
            // In SRE, we allow the logger to flush asynchronously before exiting if it's a fatal crash
            setTimeout(() => {
                logger.fatal('Terminating process due to uncaughtException');
                process.exit(1);
            }, 1000);
        });

        process.on('unhandledRejection', (reason, promise) => {
            const err = reason instanceof Error ? reason : new Error(String(reason));
            this.captureException(err, { category: 'unhandled_rejection', fatal: false });
        });

        logger.info('[CRASH] Global SRE uncaughtException and unhandledRejection hooks activated.');
    }

    /**
     * Check if Sentry error reporting is active in production
     */
    static isSentryActive() {
        return isSentryEnabled;
    }
}

module.exports = CrashReportingService;
