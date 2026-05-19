const mongoose = require('mongoose');

const tenantBrandingSchema = new mongoose.Schema({
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true },
    customDomain: { type: String, unique: true, sparse: true },
    domainVerified: { type: Boolean, default: false },
    theme: {
        primaryColor: { type: String, default: '#0056b3' },
        secondaryColor: { type: String, default: '#ffffff' },
        logoUrl: { type: String },
        faviconUrl: { type: String }
    },
    smtpConfig: {
        host: String,
        port: Number,
        user: String,
        pass: String, // Encrypted
        fromEmail: String
    },
    whitelabelCertificates: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TenantBranding', tenantBrandingSchema);
