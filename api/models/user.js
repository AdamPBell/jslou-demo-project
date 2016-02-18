"use strict";
var config = require("config");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
var logger = require("winston");


var UserSchema = new Schema({
    userId: { type: String, required: true },
    email: {
        required: true,
        type: String
    },
    passwordHash: {
        required: true,
        type: String
    },
    name: {
        first: String,
        last: String
    },
    roles: [],
    createdTimeStamp: {
        type: Date,
        required: true
    },
    lastUpdatedTimeStamp: {
        type: Date,
        required: true
    }
});

UserSchema.methods.verifyPassword = function verifyPassword(password, next) {
    bcrypt.compare(password, this.passwordHash, next);
};

UserSchema.statics.hashPassword = function hashPassword(password, next) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            logger.error(err);
            return next(err);
        }
        logger.info("salt generated...", salt);
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                logger.error("Error hashing password", err);
                return next(err);
            }
            logger.info("password hashed...", hash);
            return next(null, hash);
        });
    });
};




UserSchema.pre("validate", function (next) {
    if (!this.createdTimeStamp)
        this.createdTimeStamp = new Date();

    this.lastUpdatedTimeStamp = new Date();

    return next();
});

var mongoUri = "mongodb://localhost/presentation";
var mongoConfigKey = "mongo";
if (config.has(mongoConfigKey))
    mongoUri = config.get(mongoConfigKey);
mongoUri = process.env.MONGO_URI || mongoUri;

var db = mongoose.createConnection(mongoUri);
var User = db.model('User', UserSchema);

module.exports = User;