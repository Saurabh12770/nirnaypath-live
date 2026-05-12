
/**
 * Resolves topic identity across inconsistent data sources (JSON vs Mongo)
 * Supports both topic and topicId fields for maximum backward compatibility.
 */
const resolveTopicIdentifier = (question) => {
    const q = question._doc || question;
    const identifier = q.topicId || q.topic || 'General';
    return identifier.toLowerCase().trim();
};

/**
 * Standardizes subject identifier
 */
const resolveSubjectIdentifier = (question) => {
    const q = question._doc || question;
    const identifier = q.subjectId || q.subject || 'all';
    return identifier.toLowerCase().trim();
};

module.exports = { 
    resolveTopicIdentifier,
    resolveSubjectIdentifier
};
