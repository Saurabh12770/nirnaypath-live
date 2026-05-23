'use strict';

/**
 * NirnayPath — Cursor Pagination Utility (Phase 11 — Module A)
 * ============================================================
 * Efficient cursor-based pagination for large collections.
 * Uses _id as the default cursor — no SKIP/OFFSET (which kills performance at scale).
 *
 * Pattern: client receives `nextCursor`, passes it on next request.
 * Supports: forward pagination, field-based cursors, sort flexibility.
 */

const mongoose = require('mongoose');

/**
 * Paginate a Mongoose model using cursor-based pagination.
 *
 * @param {Model}  Model        Mongoose model to query
 * @param {Object} filter       MongoDB filter object
 * @param {Object} options
 * @param {number}   options.limit       Records per page (default 20, max 100)
 * @param {string}   options.cursor      Opaque cursor from previous response
 * @param {string}   options.sortField   Field to sort on (default '_id')
 * @param {number}   options.sortDir     1=asc, -1=desc (default -1)
 * @param {Object}   options.projection  Fields to include
 * @param {string[]} options.populate    Fields to populate
 * @returns {Promise<{ data, nextCursor, hasMore, count }>}
 */
async function cursorPaginate(Model, filter = {}, options = {}) {
    const {
        limit:     rawLimit  = 20,
        cursor:    rawCursor = null,
        sortField            = '_id',
        sortDir              = -1,
        projection           = null,
        populate             = []
    } = options;

    const limit = Math.min(Math.max(parseInt(rawLimit) || 20, 1), 100);

    // Decode cursor
    let cursorFilter = {};
    if (rawCursor) {
        try {
            const decoded = JSON.parse(Buffer.from(rawCursor, 'base64').toString('utf8'));
            const cursorValue = decoded.v;
            // Apply cursor: get records after the cursor position
            if (sortField === '_id') {
                cursorFilter = { _id: { [sortDir === -1 ? '$lt' : '$gt']: new mongoose.Types.ObjectId(cursorValue) } };
            } else {
                // For non-_id fields, combine with _id for stable tie-breaking
                cursorFilter = {
                    $or: [
                        { [sortField]: { [sortDir === -1 ? '$lt' : '$gt']: cursorValue } },
                        {
                            [sortField]: cursorValue,
                            _id: { [sortDir === -1 ? '$lt' : '$gt']: new mongoose.Types.ObjectId(decoded.id) }
                        }
                    ]
                };
            }
        } catch {
            // Invalid cursor — ignore and start from beginning
        }
    }

    const combinedFilter = { ...filter, ...cursorFilter };
    const sort = { [sortField]: sortDir, _id: sortDir };

    // Fetch limit+1 to detect hasMore
    let query = Model.find(combinedFilter)
        .sort(sort)
        .limit(limit + 1)
        .lean();

    if (projection) query = query.select(projection);

    for (const field of populate) {
        query = query.populate(field);
    }

    const docs = await query;
    const hasMore = docs.length > limit;
    const data = hasMore ? docs.slice(0, limit) : docs;

    // Encode next cursor
    let nextCursor = null;
    if (hasMore && data.length > 0) {
        const lastDoc = data[data.length - 1];
        const cursorPayload = {
            v:  sortField === '_id' ? String(lastDoc._id) : lastDoc[sortField],
            id: String(lastDoc._id)
        };
        nextCursor = Buffer.from(JSON.stringify(cursorPayload)).toString('base64');
    }

    return {
        data,
        nextCursor,
        hasMore,
        count: data.length
    };
}

/**
 * Encode a plain value as an opaque cursor.
 */
function encodeCursor(value) {
    return Buffer.from(JSON.stringify({ v: value, id: String(value) })).toString('base64');
}

/**
 * Decode a cursor back to its raw value.
 */
function decodeCursor(cursor) {
    try {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    } catch {
        return null;
    }
}

module.exports = { cursorPaginate, encodeCursor, decodeCursor };
