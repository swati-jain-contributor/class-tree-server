var express = require('express');
var helper = require('./helper');


var routes = function (Apartment) {
    var accountRouter = express.Router();

    var accountController = require('../Controllers/accountController')();

    accountRouter.route('/createmaintainence').post(function (req, res) {
        if (req.session.role == 'President') {
            Apartment.findOne({ _id: req.session.aptId }).populate("maintainenceFunds").exec().then(function (data) {
                console.log(data.maintainenceFunds);
                var maintainence = data.maintainenceFunds.find(arr => arr.type.toLowerCase() == req.body.type.toLowerCase() && arr.month == req.body.month && arr.year == req.body.year);
                if (maintainence) {
                    res.send(helper.formatFailure("Maintainence of " + req.body.type + " already created in this month"));
                    return;
                }
                else if (req.body.type.toLowerCase().indexOf("other") > -1) {
                    res.send(helper.formatFailure("Invalid Maintainence type"));
                }
                else {
                    return accountController.createMaintainence(req).then(function (data) {
                        res.send(helper.formatSuccess(data));
                    }).catch(function (err) {
                        res.send(helper.formatFailure(err));
                    });
                }
            });
        }
        else
            res.send(helper.formatFailure("You are not authorised"));
    });

    accountRouter.route('/getallmaintainence').post(function (req, res) {
        return accountController.getAllMaintainence(req).then(function (data) {
            res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            res.send(helper.formatFailure(err));
        });
    });
    accountRouter.route('/addexpense').post(function (req, res) {
        if (req.session.role == 'President') {
            try {
                var s = accountController.addExpense(req);
                return s.then(function (data) {
                    console.log("Expense Added");
                    return res.send(helper.formatSuccess(data));
                }).catch(function (err) {                    
                    console.log(err);
                    res.send(helper.formatFailure(err));
                });
            }
            catch(err){
                res.send(helper.formatFailure(err));
            }        
        }
        else
            res.send(helper.formatFailure("You are not authorised"));
    });
    accountRouter.route('/getmemberstmt').post(function (req, res) {
        return accountController.getMemberStmt(req).then(function (data) {
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            res.send(helper.formatFailure(err));
        });
    });
    accountRouter.route('/getsocietyfunds').post(function (req, res) {
        return accountController.getSocietyFunds(req).then(function (data) {
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            res.send(helper.formatFailure(err));
        });
    });
    accountRouter.route('/getpendingmaintainence').post(function (req, res) {
        return accountController.getPendingMaintainence(req).then(function (data) {
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            res.send(helper.formatFailure(err));
        });
    });
    accountRouter.route('/paymaintainence').post(function (req, res) {
        var s = accountController.payMaintainence(req);
        return s.then(function (data) {
            return res.send(helper.formatSuccess(data));
        }, function (err) {
            return res.send(helper.formatFailure(err));
        });
    });

    accountRouter.use(function (req, res, next) {
        Apartment.findOne({ _id: req.session.aptId }).populate("maintainenceFunds").exec().then(function (data) {
            var maintainence = data.maintainenceFunds.find(arr => arr._id == req.body.id);
            if (maintainence) {
                req.session.maintainence = maintainence;
                next();
            }
            else {
                res.send(helper.formatFailure("No such maintainence exist"));
            }
        });
    });
    accountRouter.route('/blockmaintainence').post(function (req, res) {
        var s = accountController.blockMaintainence(req);
        return s.then(function (data) {
            return res.send(helper.formatSuccess(data));
        }, function (err) {
            return res.send(helper.formatFailure(err));
        });
    });
    accountRouter.route('/getmaintainencedetails').post(function (req, res) {
        return accountController.getMaintainenceDetails(req).then(function (data) {
            return res.send(helper.formatSuccess(data));
        }).catch(function (err) {
            return res.send(helper.formatFailure(err));
        });
    });


    return accountRouter;
};

module.exports = routes;    