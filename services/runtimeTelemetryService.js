class RuntimeTelemetryService {
    constructor() {
        this.metrics = {
            errors: [], // [{ message, source, lineno, colno, error, timestamp, type }]
            slowApis: [], // [{ url, duration, status, timestamp }]
            failedRequests: [], // [{ url, status, error, timestamp }]
            memorySnapshots: [], // [{ usedJSHeapSize, timestamp }]
            longTasks: [], // [{ duration, timestamp }]
            routeNavigations: [], // [{ from, to, duration, timestamp }]
            listenerGrowth: [], // [{ count, timestamp }]
        };
        
        this.stats = {
            activeUsers: new Set(),
            browserUsage: {}, // { 'Chrome': 10, 'Firefox': 2 }
            sessionDurations: [], // [{ sessionId, durationMs }]
            evictionCount: 0,
            droppedEvents: 0,
            totalIngested: 0,
            startTime: Date.now(),
            unsupportedBrowsers: 0,
            viewportUsage: {},
            platformUsage: {}
        };
        
        this.apiStats = {}; // { '/api/...': { count, sum, min, max, failed } }
        this.MAX_ITEMS = 1000;
    }

    _pushBounded(array, item) {
        array.push(item);
        if (array.length > this.MAX_ITEMS) {
            array.shift();
            this.stats.evictionCount++;
        }
    }

    ingest(payload) {
        if (!payload || !payload.events) return;
        
        const timestamp = Date.now();
        const sessionId = payload.sessionId || 'anonymous';
        
        if (sessionId !== 'anonymous') {
            this.stats.activeUsers.add(sessionId);
        }

        if (payload.userAgent) {
            // Simple parsing for browser usage
            let browser = 'Other';
            if (payload.userAgent.includes('Chrome')) browser = 'Chrome';
            else if (payload.userAgent.includes('Firefox')) browser = 'Firefox';
            else if (payload.userAgent.includes('Safari')) browser = 'Safari';
            else if (payload.userAgent.includes('Edge')) browser = 'Edge';
            
            this.stats.browserUsage[browser] = (this.stats.browserUsage[browser] || 0) + 1;
        }

        if (payload.platform) {
            this.stats.platformUsage[payload.platform] = (this.stats.platformUsage[payload.platform] || 0) + 1;
        }
        
        if (payload.viewport) {
            this.stats.viewportUsage[payload.viewport] = (this.stats.viewportUsage[payload.viewport] || 0) + 1;
        }

        payload.events.forEach(event => {
            this.stats.totalIngested++;
            event.timestamp = event.timestamp || timestamp;
            event.sessionId = sessionId;

            switch (event.type) {
                case 'error':
                    this._pushBounded(this.metrics.errors, event);
                    break;
                case 'api':
                    if (event.status >= 400 || event.error) {
                        this._pushBounded(this.metrics.failedRequests, event);
                    }
                    if (event.duration > 1000) { 
                        this._pushBounded(this.metrics.slowApis, event);
                    }
                    
                    if (event.url) {
                        if (!this.apiStats[event.url]) {
                            this.apiStats[event.url] = { count: 0, sum: 0, min: Infinity, max: 0, failed: 0 };
                        }
                        const stat = this.apiStats[event.url];
                        stat.count++;
                        stat.sum += event.duration;
                        stat.min = Math.min(stat.min, event.duration);
                        stat.max = Math.max(stat.max, event.duration);
                        if (event.status >= 400 || event.error) stat.failed++;
                    }
                    break;
                case 'memory':
                    this._pushBounded(this.metrics.memorySnapshots, event);
                    break;
                case 'memory_unsupported':
                    this.stats.unsupportedBrowsers++;
                    break;
                case 'longtask':
                    this._pushBounded(this.metrics.longTasks, event);
                    break;
                case 'navigation':
                    this._pushBounded(this.metrics.routeNavigations, event);
                    break;
                case 'listener_count':
                    this._pushBounded(this.metrics.listenerGrowth, event);
                    break;
                case 'session_end':
                    if (event.duration) {
                        this._pushBounded(this.stats.sessionDurations, { sessionId, durationMs: event.duration, timestamp });
                        this.stats.activeUsers.delete(sessionId);
                    }
                    break;
                default:
                    // Unknown event type
                    this.stats.droppedEvents++;
                    break;
            }
        });
    }

    getOverview() {
        const uptimeSec = (Date.now() - this.stats.startTime) / 1000;
        const ingestionRate = uptimeSec > 0 ? (this.stats.totalIngested / uptimeSec) : 0;

        // Compute averages and trends
        const avgSessionDuration = this.stats.sessionDurations.length > 0 
            ? this.stats.sessionDurations.reduce((acc, val) => acc + val.durationMs, 0) / this.stats.sessionDurations.length 
            : 0;

        // Queue behavior
        const queueCurrentSize = Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0);

        return {
            activeUsersCount: this.stats.activeUsers.size,
            errorCount: this.metrics.errors.length,
            slowApis: this.metrics.slowApis.slice(-10).reverse(),
            failedRequests: this.metrics.failedRequests.slice(-10).reverse(),
            recentErrors: this.metrics.errors.slice(-10).reverse(),
            memoryTrend: this.metrics.memorySnapshots.slice(-50), // For charting
            longTasks: this.metrics.longTasks.slice(-10).reverse(),
            browserUsage: this.stats.browserUsage,
            avgSessionDurationMs: avgSessionDuration,
            listenerGrowth: this.metrics.listenerGrowth.slice(-20),
            timestamp: Date.now(),
            
            // Phase 9A Forensic Details
            queueBehavior: {
                maxSizePerQueue: this.MAX_ITEMS,
                currentSizeTotal: queueCurrentSize,
                evictionCount: this.stats.evictionCount,
                droppedEvents: this.stats.droppedEvents,
                totalIngested: this.stats.totalIngested,
                ingestionRatePerSec: ingestionRate
            },
            apiMetrics: this.apiStats,
            browserMetrics: {
                browserDistribution: this.stats.browserUsage,
                viewportDistribution: this.stats.viewportUsage,
                platformDistribution: this.stats.platformUsage,
                sessionDurations: this.stats.sessionDurations.map(s => s.durationMs)
            },
            memoryMetrics: {
                snapshotsCount: this.metrics.memorySnapshots.length,
                unsupportedBrowserCount: this.stats.unsupportedBrowsers
            }
        };
    }
    
    reset() {
        this.metrics = {
            errors: [], slowApis: [], failedRequests: [],
            memorySnapshots: [], longTasks: [], routeNavigations: [],
            listenerGrowth: []
        };
        this.stats = {
            activeUsers: new Set(),
            browserUsage: {},
            sessionDurations: [],
            evictionCount: 0,
            droppedEvents: 0,
            totalIngested: 0,
            startTime: Date.now(),
            unsupportedBrowsers: 0,
            viewportUsage: {},
            platformUsage: {}
        };
        this.apiStats = {};
    }
}

module.exports = new RuntimeTelemetryService();
