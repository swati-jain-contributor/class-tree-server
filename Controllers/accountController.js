var models = require('../models/aptModel');
var accountController = function () {
    var createMaintainence = function (req) {
        var m = new models.Maintainence();
        m.type = req.body.type;
        m.amt = req.body.amt;
        m.month = req.body.month;
        m.year = req.body.year;
        m.members = [];
        m.paidBy = '';
        m.blockBy = '';
        m.createdBy = req.session.userId;
        m.updatedBy = req.session.userId;
        var apt = req.session.apartment;
        return m.saveAsync().then(function (data) {
            console.log("Maintainenece Created");
            console.log(data);
            apt.maintainenceFunds.push(data._id);
            var t = new models.Transaction();
            t.tranId = data._id;
            t.category = 'MP';
            //t.date = Date.now;
            t.amount = 0;
            t.type = 'cr';
            t.remarks = m.type + ' ' + m.month + ' ' + m.year;
            t.currency = 'INR';
            t.status = 'In Progress';
            t.status.createdBy = req.session.userId;
            t.status.updatedBy = req.session.userId;
            // t.createdOn = Date.now;
            // t.updatedOn = Date.now;
            return t.saveAsync()
        }).then(function (data) {
            console.log("Transaction Created");
            apt.aptFunds.transactions.push(data._id);
            return apt.saveAsync();
        }).then(function (data) {
            console.log("Added to apartment");
            return m;
        });
    };
    var getAllMaintainence = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'maintainenceFunds',
                model: models.Maintainence,
                populate: {
                    path: 'Maintainence',
                    model: models.Maintainence
                }
            }).execAsync()
            .then(function (data) {
                return data.maintainenceFunds;
            });
    };
    var blockMaintainence = function (req) {
        var mem = req.session.maintainence;
        if (req.body.isBlock) {
            mem.members.push({
                member: req.body.memberId,
                status: 'Block',
                paidOn: Date.now()
            });
            mem.blockBy += '$' + req.body.memberId + '$';
        }
        else {
            var index = -1;
            console.log(req.body.memberId);
            for (var i = 0; i < mem.members.length; i++) {
                console.log(mem.members[i].member);
                if (mem.members[i].member === req.body.memberId) {
                    index = i;
                    break;
                }
            }
            console.log("spider man:" + index);
            var s = index > -1 ? mem.members.splice(index, 1) : null;
            if (mem.blockBy != undefined)
                mem.blockBy = mem.blockBy.replace('$' + req.body.memberId + '$', "");
        }
        return mem.saveAsync();
    };
    var payMaintainence = function (req) {
        var transactions = [];
        return models.Apartment.findOne({ _id: req.session.aptId }).populate("maintainenceFunds").exec().then(function (data) {
            for (var i = 0; i < req.body.ids.length; i++) {
                var maintainence = data.maintainenceFunds.find(arr => arr._id == req.body.ids[i]);
                (function (maintainence) {
                    var t = new models.Transaction();
                    if (req.body.isCash)
                        t.tranId = "cash";
                    else
                        t.tranId = '274397243428347';
                    t.category = 'M';
                    //t.date = Date.now;
                    t.amount = maintainence.amt;
                    t.type = 'cr';
                    t.remarks = maintainence.type + ' ' + maintainence.month + ' ' + maintainence.year;
                    t.currency = 'INR';
                    t.status = 'Success';
                    t.status.createdBy = req.session.userId;
                    t.status.updatedBy = req.session.userId;
                    //t.createdOn = Date.now;
                    //t.updatedOn = Date.now;
                    var m = t.saveAsync().then(function (data) {
                        console.log("Transaction Created");
                        if (req.body.memberId)
                            var memId = req.body.memberId;
                        else
                            var memId = req.session.memberid;
                        maintainence.members.push({
                            member: memId,
                            status: 'Success',
                            paidOn: Date.now(),
                            transaction: data._id
                        });
                        maintainence.paidBy += '$' + memId + '$';
                        return models.Transaction.findOne({ tranId: maintainence._id, category: 'MP' }).exec();
                    }).then(function (data) {
                        console.log("Transaction Found");
                        data.amount = data.amount + t.amount;
                        return data.saveAsync()
                    }).then(function (data) {
                        console.log("Transaction Updated");
                        console.log(maintainence);
                        return maintainence.saveAsync();
                    }).then(function (data) {
                        console.log("Added to Maintainence");
                        data.amount = data.amount + t.amount;
                        var apt = req.session.apartment;
                        apt.aptFunds.currentBalance = apt.aptFunds.currentBalance + t.amount;
                        apt.saveAsync();
                        if (req.body.memberId)
                            var memId = req.body.memberId;
                        else
                            var memId = req.session.memberid;
                        models.Member.findOne({ _id: memId }).exec().then(function (member) {
                            console.log("Member Found");
                            member.transactions.push(t._id);
                            member.saveAsync();
                        }, function (err) {
                            console.log('Error' + err);
                        });
                        return t;
                    }, function (err) {
                        console.log(err);
                        return err;
                    });
                    transactions.push(m);
                }(maintainence));
            }
            return Promise.all(transactions).then(function (data) {
                return data;
            });
        });
    };
    var validateAmount = function (req) {
        var apt = req.session.apartment;
        if (apt.aptFunds.currentBalance >= req.body.amount)
            return true;
        else
            return false;
    }
    var addExpense = function (req) {
        isValid= validateAmount(req);
        if (isValid) {
            var t = new models.Transaction();
            t.tranId = '274397243428347';
            t.category = 'E';
            t.date = Date.now();
            t.amount = req.body.amount;
            t.type = 'dr';
            t.remarks = req.body.remarks;
            t.currency = 'INR';
            t.status = 'Success';
            t.status.createdBy = req.session.userId;
            t.status.updatedBy = req.session.userId;
            t.createdOn = Date.now();
            t.updatedOn = Date.now();
            return t.saveAsync().then(function (data) {
                var apt = req.session.apartment;
                apt.aptFunds.transactions.push(data._id);
                apt.aptFunds.currentBalance = apt.aptFunds.currentBalance - t.amount;
                return apt.saveAsync();
            }).then(function (data) {
                return t;
            });
        }
        else {
            throw ("Insufficient Funds.");
        }
    };
    var getMemberStmt = function (req) {
        var sd = new Date(req.body.startDate);
        var ed = new Date(req.body.endDate);
        console.log("Start Date" + sd);
        console.log("End Date" + ed);
        if (req.body.id == undefined)
            var mem = req.session.memberid;
        else
            var mem = req.body.id;
        return models.Member.findOne({ _id: mem }).populate({
            path: 'transactions',
            match: { 'createdOn': { $gt: sd, $lt: ed } },
            model: models.Transaction
        }).execAsync()
            .then(function (member) {
                member.transactions.sort(function (a, b) {
                    a = new Date(a.createdOn);
                    b = new Date(b.createdOn);
                    return b - a;
                });
                return member.transactions;
            });
    };
    var getSocietyFunds = function (req) {
        var sd = new Date(req.body.startDate);
        var ed = new Date(req.body.endDate);
        console.log("Start Date" + sd);
        console.log("End Date" + ed);
        return models.Apartment.findOne({ _id: req.session.apartment._id }).populate({
            path: 'aptFunds.transactions',
            match: { 'createdOn': { $gt: sd, $lt: ed } },
            options: {
                limit: 100,
                sort: { createdOn: -1 }
            },
            model: models.Transaction
        }).execAsync().then(function (apt) {
            // apt.aptFunds.transactions.sort(function (a, b) {
            //     a = new Date(a.createdOn);
            //     b = new Date(b.createdOn);
            //     return b - a;
            // });
            return apt.aptFunds;
        });
    };
    var getMaintainenceDetails = function (req) {
        return models.Maintainence.findOne({ _id: req.session.maintainence._id }).populate({
            path: 'members.member',
            model: models.Member
        }).execAsync()
            .then(function (member) {
                return member;
            });
    };
    var getPendingMaintainence = function (req) {
        var arr = [];
        return models.Apartment.findOne({ _id: req.session.apartment._id })
            .populate("maintainenceFunds")
            .execAsync()
            .then(function (data) {
                data.maintainenceFunds.forEach(function (m) {
                    if (m.paidBy != undefined && m.paidBy.indexOf('$' + req.session.memberid + '$') == -1) {
                        arr.push(m);
                    }
                });
                return arr;
            });
    };
    return {
        createMaintainence,
        payMaintainence,
        addExpense,
        getMemberStmt,
        getSocietyFunds,
        getMaintainenceDetails,
        getPendingMaintainence,
        getAllMaintainence,
        blockMaintainence
    }
}
module.exports = accountController;