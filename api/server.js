"use strict";
exports = module.exports = {};

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var config = require("config");


var passport = require("passport");
var BearerStrategy = require("passport-http-bearer");
var LocalStrategy = require("passport-local");

var Session = require("./models/session");
var User = require("./models/user");
var logger = require("winston");

logger.remove(logger.transports.Console); // Get rid of the default console logger
logger.add(logger.transports.Console, {
    colorize: true,
    timestamp: true,
    prettyPrint: true,
    handleExceptions: true,
    humanReadableUnhandledException: true
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var corsOptions = {
    origin: true,
};
app.use(cors(corsOptions));
app.use(passport.initialize());

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ userId: username }, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false);
            logger.info("found user...", user.toObject());
            user.verifyPassword(password, function (err, isValid) {
                if (isValid) return done(null, user, 'all');
                else return done(null, false);
            });
        });
    }
    ));


passport.use(new BearerStrategy(
    function (token, done) {
        Session.findOne({ token: token }, function (err, session) {
            if (err) return done(err);
            if (!session) { return done(null, false); }
            if (session.isExpired()) {
                return done(null, false);
            }
            else {
                return done(null, session, 'all');
            }
        });
    }
    ));


// var user = { userId: "admin", password: "Password", name: "Default Admin User", email: "admin@admin.com" };
// user.passwordHash = User.hashPassword(user.password, function (err, hashedPassword) {
//     user.passwordHash = hashedPassword;
//     User.create(user, function (err, result) {
//         logger.info("created new user...", result.toObject());
//     });
// });




app.post("/login",
    passport.authenticate("local", { session: false }),
    function (req, res) {
        var user = null;
        logger.info(req.user);
        user = req.user;

        Session.create({ user: user }, function (err, session) {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.send(session);
        });
    });

app.get("/logout", passport.authenticate('bearer', { session: false }), function (req, res) {
    Session.findOneAndRemove({ token: req.user.token }, function (err, session) {
        console.log("session logged out", session);
        if (err) return res.send(err);
        req.logout();
        res.send();
    });
});


app.get("/token/valid",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        res.send(req.user);
    });

app.post("/user/create",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        var userToCreate = req.body;
        var user = new User(userToCreate);
        logger.info(userToCreate, user.toObject());
        User.hashPassword(userToCreate.password, function (err, hashedPassword) {
            if (err) {
                logger.error(err);
                return res.status(500).send(err);
            }
            user.passwordHash = hashedPassword;
            logger.info("password hashed...");
            logger.info("validaing...");
            user.validate(function (err) {
                logger.info("validation complete...");
                if (err) {
                    logger.error(err);
                    return res.status(500).send(err);
                }
                logger.info("creating user...", user);
                User.create(user, function (err, result) {
                    if (err) {
                        logger.error(err);
                        return res.status(500).send(err);
                    }
                    return res.send(result);
                });
            });
        });
    });

app.post("/user/update",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        var session = req.user;
        var userToUpdate = req.body;
        var user = new User(userToUpdate);

        if (user.password && user.password.length > 0) {
            user.passwordHash = User.hashPassword(user.password, function (err, hashedPassword) {
                if (err) {
                    logger.error(err);
                    return res.status(500).send(err);
                }
                user.passwordHash = hashedPassword;
                user.validate(function (err) {
                    if (err) {
                        logger.error(err);
                        return res.status(500).send(err);
                    }
                    User.findOneAndUpdate({ _id: user._id }, user, function (err, updatedUser) {
                        if (err) {
                            logger.error(err);
                            return res.status(500).send(err);
                        }
                        return res.send(updatedUser);
                    });
                });
            });
        } else {
            user.validate(function (err) {
                User.findOneAndUpdate({ _id: user._id }, user, function (err, updatedUser) {
                    if (err) {
                        logger.error(err);
                        return res.status(500).send(err);
                    }
                    return res.send(updatedUser);
                });
            });
        }
    });


app.get("/user/read/:id",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        User.findById(req.params.id, function (err, user) {
            if (err) return res.status(500).send(err);
            return res.send(user);
        });
    });


app.get("/user/list",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        User.find({}, function (err, users) {
            if (err) return res.status(500).send(err);
            return res.send(users);
        });
    });
app.get("/user/delete/:id",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        User.remove({ _id: req.params.id }, function (err) {
            if (err) {
                logger.error(err);
                return res.status(500).send(err);
            }
            return res.send("Removed User");
        });
    });

app.get("/session/list",
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        Session.find({}, function (err, users) {
            if (err) return res.status(500).send(err);
            return res.send(users);
        });
    });
app.get("/session/delete/:id", passport.authenticate('bearer', { session: false }),
    function (req, res) {
        Session.remove({ _id: req.params.id }, function (err) {
            if (err) {
                logger.error(err);
                return res.status(500).send(err);
            }
            return res.send("Removed Session");
        });
    });


var port = 3000;
var portConfigKey = "server.port";
if (process.env.PORT)
    port = process.env.PORT;
else if (config.has(portConfigKey))
    port = config.get(portConfigKey);

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger.info("We are listening on http://%s:%s", host, port);
});