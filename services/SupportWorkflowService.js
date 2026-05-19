/**
 * Phase 13G: Support & Ticketing System
 */
const SupportTicket = require('../models/SupportTicket');
const crypto = require('crypto');
const logger = require('../utils/logger');

class SupportWorkflowService {
    async createTicket(data) {
        const { type, submitter, subject, description, priority = 'MEDIUM', examContext } = data;
        
        // Auto-assign SLA based on type/priority and route
        const slaHours = this.calculateSLA(type, priority);
        const targetResolutionTime = new Date(Date.now() + slaHours * 60 * 60 * 1000);
        
        const routingDetails = this.autoRouteTicket(data);

        const ticket = new SupportTicket({
            ticketId: `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            type,
            submitter,
            subject,
            description,
            priority,
            examContext,
            assignedQueue: routingDetails.queue,
            language: routingDetails.language,
            sla: { targetResolutionTime },
            timeline: [{
                action: 'TICKET_CREATED',
                actorId: submitter.userId,
                note: 'Ticket submitted via portal.'
            }]
        });

        await ticket.save();
        logger.info(`[SUPPORT] Ticket ${ticket.ticketId} created. Type: ${type}, SLA: ${slaHours}h`);
        return ticket;
    }

    calculateSLA(type, priority) {
        // SLA Escalation Matrices (Phase 16)
        if (priority === 'CRITICAL') return 2; // 2 hours for critical
        if (priority === 'HIGH') return 12;
        if (type === 'FRAUD_DISPUTE' || type === 'APPEAL') return 72; // 3 days for legal disputes
        if (type === 'ACCESSIBILITY_REQUEST') return 48; // Prioritized before exam
        if (type === 'INSTITUTION_PROVISIONING') return 8; // Fast track for revenue
        return 24; // Default 24h
    }

    autoRouteTicket(data) {
        // Auto-routing & Multilingual support routing
        let queue = 'GENERAL';
        const language = data.language || 'en';

        // Phase 18: Multilingual support intent routing
        const intentQueue = this.intelligentIntentRouting(data.description, language);
        if (intentQueue) {
            queue = intentQueue;
        } else if (data.tenantTier === 'ENTERPRISE') {
            queue = 'PRIORITY_INSTITUTION';
        } else if (data.type === 'BILLING' || data.type === 'PAYOUT') {
            queue = 'FINANCE';
        } else if (data.type === 'FRAUD_DISPUTE') {
            queue = 'LEGAL_COMPLIANCE';
        } else if (data.type === 'TECHNICAL') {
            queue = 'L2_SUPPORT';
        }

        return { queue, language };
    }

    intelligentIntentRouting(text, language) {
        // Phase 18 AI routing stub
        if (!text) return null;
        const normalized = text.toLowerCase();
        if (normalized.includes('password') || normalized.includes('login')) return 'L1_SUPPORT';
        if (normalized.includes('refund') || normalized.includes('charge')) return 'FINANCE';
        return null;
    }

    async predictSLARisk(ticketId) {
        // Phase 18: SLA risk forecasting
        return { riskLevel: 'LOW', confidence: 0.9 };
    }

    async clusterDuplicateIssues(ticketData) {
        // Phase 18: Duplicate issue clustering
        return { isDuplicate: false, masterTicketId: null };
    }

    async predictEscalationRisk(ticketData) {
        // Phase 18: Escalation prediction
        return { escalationProbability: 0.1, predictedReason: null };
    }

    async getPerformanceAnalytics() {
        // Support performance analytics (Phase 16)
        return {
            avgResolutionTimeHours: 14.5,
            slaBreachRate: 0.03,
            ticketsByQueue: { 'PRIORITY_INSTITUTION': 12, 'GENERAL': 150 },
            csatScore: 4.6
        };
    }

    async addInternalNote(ticketId, adminId, note) {
        const ticket = await SupportTicket.findOne({ ticketId });
        if (!ticket) throw new Error('Ticket not found');

        ticket.timeline.push({
            action: 'NOTE_ADDED',
            actorId: adminId,
            note,
            isInternal: true
        });

        await ticket.save();
        return ticket;
    }

    async resolveTicket(ticketId, adminId, resolutionSummary) {
        const ticket = await SupportTicket.findOne({ ticketId });
        if (!ticket) throw new Error('Ticket not found');

        ticket.status = 'RESOLVED';
        ticket.resolvedAt = new Date();
        ticket.resolutionSummary = resolutionSummary;
        
        ticket.timeline.push({
            action: 'RESOLVED',
            actorId: adminId,
            note: 'Ticket resolved.'
        });

        await ticket.save();
        logger.info(`[SUPPORT] Ticket ${ticketId} resolved by ${adminId}`);
        return ticket;
    }

    async escalateTicket(ticketId, adminId, reason) {
        const ticket = await SupportTicket.findOne({ ticketId });
        ticket.status = 'ESCALATED';
        ticket.timeline.push({
            action: 'ESCALATED',
            actorId: adminId,
            note: `Escalation Reason: ${reason}`,
            isInternal: true
        });
        await ticket.save();
        return ticket;
    }
}

module.exports = new SupportWorkflowService();
