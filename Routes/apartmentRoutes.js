var express = require('express');
var Session = require('../models/sessionModel');
var helper = require('./helper');
var sms = require('../helpers/send-sms');

var routes = function (Apartment) {
    var apartmentRouter = express.Router();
    var apartmentController = require('../Controllers/apartmentController')(Apartment);
    apartmentRouter.route('/register').post(function (req, res) {
        var member;
        var session;
        var apt;
        if (req.body.isPresident) {
            apartmentController.createNewApartment(req).then(function (data) {
                apt = data;
                console.log("Apartment Created");
                return Apartment.find({ _id: data._id }).populate("members").exec();
            }).then(function (data) {
                sms.sendSms(data[0].members[0].phone, "Your OTP is: " + data[0].members[0].otp + ". OTP is confidential. Use the above One Time Password to verify your identity on Live Together.");
                res.send(helper.formatSuccess(data[0]));
            }).catch(function (err) {
                console.log(err);
                res.send(helper.formatFailure(err));
            });
        }
        else {
            apartmentController.createNewRequest(req).then(function (data) {
                sms.sendSms(data.member.phone, "Your OTP is: " + data.member.otp + ". OTP is confidential. Use the above One Time Password to verify your identity on Live Together.");
                res.send(helper.formatSuccess(data));
            }, function (err) {
                console.log(err);
                res.send(helper.formatFailure(err));
            });
        }
    });
    apartmentRouter.route('/login').post(function (req, res) {
        var member;
        var session;
        var apt;
        if (req.body.type == "L") {
            var s = { username: req.body.username, otp: req.body.otp, type: "L" };
            return apartmentController.verifyCredentials(s).then(function (data) {
                member = data;
                console.log(data);
                if (data) {
                    console.log("Credentials Validated");
                    return Session.findOneAsync({ 'authCode': req.headers["auth-token"] })
                }
                else {                    
                    res.send(helper.formatFailure("invalid credentials"));
                    return false;
                }
            }).then(function (data) {
                if (data) {
                    session = data;
                    console.log(session);
                    session.userId = member.memberId;
                    session.role = member.role;
                    session.name = member.name;
                    session.memberid = member._id;
                    session.aptId = req.body.username.split('-')[0];
                    session.updatedAt = Date.now();
                    session.authenticationStatus = true;
                    session.save();
                    console.log("Credentials Validated");
                    res.send(helper.formatSuccess(session));
                }
            }).catch(function (err) {
                console.log("Inerror");
                console.log(err);
                res.send(helper.formatFailure(err));
            });
        }
        else {
            var aptId;
            return apartmentController.verifyCredentials(req).then(function (data) {
                member = data.member;
                aptId = data.aptId;
                if (data) {
                    console.log("Credentials Validated");
                    return Session.findOneAsync({ 'authCode': req.headers["auth-token"] })
                }
                else {
                    res.send(helper.formatFailure("invalid credentials"));
                }
            }).then(function (data) {
                session = data;
                console.log(session);
                session.userId = member.memberId;
                session.role = member.role;
                session.name = member.name;
                session.memberid = member._id;
                session.aptId = aptId;
                session.updatedAt = Date.now();
                session.authenticationStatus = false;
                session.save();
                console.log("Session Created");
                res.send(helper.formatSuccess(session));
            }).catch(function (err) {
                res.send(helper.formatFailure(err));
            });
        }


    });
    apartmentRouter.route('/getallmembers').get(function (req, res) {
        apartmentController.getAllMembers(req).then(function (data) {
            console.log("Members Received");
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            console.log(err);
            res.send(helper.formatFailure(err));
        });
    });
    apartmentRouter.route('/sendOTP').post(function (req, res) {
        apartmentController.saveOTP(req).then(function (data) {
            console.log(data);
            sms.sendSms(data.phone, "Your OTP is: " + data.otp + ". OTP is confidential. Use the above One Time Password to verify your identity on Live Together.");
            return res.send(helper.formatSuccess(data.otp));
        }).catch(function (err) {
            console.log("Error:");
            console.log(err);
            res.send(helper.formatFailure(err));
        });
    });
    apartmentRouter.route('/getApartmentAddress').post(function (req, res) {
        apartmentController.getApartmentAddress(req).then(function (data) {
            console.log(data);
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            res.send(helper.formatFailure(err));
        });
    });

    return apartmentRouter;
}

module.exports = routes;