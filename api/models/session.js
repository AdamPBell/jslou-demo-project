"use strict";
var config = require("config");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uuid = require("node-uuid");
var User = require("./user");


var sessionSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        userId: String,
        name: {
            first: String,
            last: String
        },
        email: String,
        roles: [String]

    },
    createdTimeStamp: {
        type: Date,
        required: true
    },
    lastUpdatedTimeStamp: {
        type: Date,
        required: true
    }
});

sessionSchema.pre("validate", function (next) {
    if (!this.createdTimeStamp)
        this.createdTimeStamp = new Date();

    if (!this.token)
        this.token = uuid.v4();

    this.lastUpdatedTimeStamp = new Date();

    next();
});

sessionSchema.methods.isExpired = function isExpired() {
    var now = (new Date()).valueOf();
    var lastUpdated = this.lastUpdatedTimeStamp.valueOf();
    var diff = (now - lastUpdated) / 60000; // Number of milliseconds in a minute
    var sessionExpiryTimeInMinutes = config.get("session.expiryTimeInMinutes");
    if (diff > sessionExpiryTimeInMinutes) return true;
    this.lastUpdatedTimeStamp = new Date();
    this.save();
    return false;
};



var mongoUri = "mongodb://localhost/presentation";
var mongoConfigKey = "mongo";
if (config.has(mongoConfigKey))
    mongoUri = config.get(mongoConfigKey);
mongoUri = process.env.MONGO_URI || mongoUri;
var db = mongoose.createConnection(mongoUri);
var Session = db.model('Session', sessionSchema);

module.exports = Session;