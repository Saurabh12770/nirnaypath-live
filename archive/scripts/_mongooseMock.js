// Minimal mongoose stub for offline test runs
// Provides only what TestResult.js needs to require() without error

'use strict';

const Schema = function(def) { this._def = def; };
Schema.prototype.index = function() {};
Schema.Types = { ObjectId: 'ObjectId' };

const mongoose = {
    Schema,
    model: () => ({
        find: async () => [],
        findById: async () => null,
        countDocuments: async () => 0,
        save: async function() { return this; }
    }),
    connect: async () => {}
};

module.exports = mongoose;
