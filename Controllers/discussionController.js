var models = require('../models/aptModel');
var notification = require('../helpers/notification-service');
var discussionController = function () {
    var addDiscussion = function (req) {
        var dis = new models.Discussion();
        dis.title = req.body.title;
        dis.type = req.body.type;
        dis.status = 'active';
        dis.createdBy = req.session.memberid;
        dis.updatedBy = req.session.memberid;
        dis.creator = req.session.name;
        dis.createdOn = Date.now();
        dis.updatedOn = Date.now();
        var msg = new models.Msg();
        msg.msg = req.body.msg;
        msg.sendAt = Date.now();
        msg.sendBy = req.session.memberid;
        msg.sender = req.session.name;
        msg.status = 'active';
        return msg.saveAsync().then(function (data) {
            console.log("Message Saved");
            dis.msgs.push(data._id);
            return dis.saveAsync();
        }).then(function (data) {
            console.log("Notice Saved");
            var apt = req.session.apartment;
            if (req.body.type == 'N')
                apt.Notices.push(data._id);
            else if (req.body.type == 'C')
                apt.Complaints.push(data._id);
            else if (req.body.type == 'D')
                apt.Discussions.push(data._id);
            apt.saveAsync();
        }).then(function (data) {
            console.log("Apartment Updated");
            var s = Object.assign({}, dis)._doc;
            s.msgs = [];
            s.msgs.push(msg);
            return s;
        });
    };
    var editNotice = function (req) {
        var dis = req.session.discussion;
        dis.title = req.body.title;
        var msgG;
        return models.Msg.findOne({ _id: dis.msgs[0] }).execAsync().then(function (msg) {
            msgG = msg;
            msg.msg = req.body.msg;
            return msg.saveAsync();
        }).then(function () {
            dis.saveAsync();
            var s = Object.assign({}, dis)._doc;
            console.log(s);
            s.msgs = [];
            s.msgs.push(msgG);
            return dis;
        });
    };
    var deleteMessage = function (req) {
        console.log("Inside delete:" + req.body.msgIds);

        return models.Msg.find({ _id: { $in: req.body.msgIds } })
            .execAsync().then(function (data) {
                console.log(data);
                data.map(s => {
                    s.msg = "This message is deleted By " + req.session.name;
                    s.status = "inactive";
                    s.saveAsync();
                })
                if (data.length == req.body.msgIds.length)
                    return true;
                else
                    return false;
            });
    }

    var addMessage = function (req) {
        var msg = new models.Msg();
        msg.msg = req.body.msg;
        msg.sendAt = Date.now();
        msg.sendBy = req.session.memberid;
        msg.status = 'active';
        msg.sender = req.session.name;
        return msg.saveAsync().then(function (data) {
            console.log("Message Saved");
            var dis = req.session.discussion;
            dis.msgs.push(data._id);
            return dis.saveAsync();
        }).then(function (data) {
            var notiData = {
                discussion: req.body,
                msg
            }
            if (req.session.discussion.type == "D")
                notification.sendMessageToAllApartmentMembers("NEW_MESSAGE", req.session.apartment._id, notiData, req.session.discussion, req.session.userId);
            else if (req.session.discussion.type == "C") {
                if (req.session.role == "President")
                    notification.sendMessageToMembers("NEW_MESSAGE", req.session.apartment._id, [req.session.discussion.createdBy], notiData, req.session.discussion, req.session.userId);
                else
                    notification.sendMessageToPresident("NEW_MESSAGE", req.session.apartment._id, notiData, req.session.discussion, req.session.userId);
            }
            else
                notification.sendMessageToAllApartmentMembers("NEW_MESSAGE", req.session.apartment._id, notiData, req.session.discussion, req.session.userId);
            return msg;
        });
    };
    var closeDiscussion = function (req) {
        var dis = req.session.discussion;
        dis.status = 'inactive';
        return dis.saveAsync().then(function () {
            return true;
        });
    };
    var getNotices = function (req) {
        return models.Apartment.findOne({ _id: req.session.apartment._id }).populate(
            {
                path: 'Notices',
                match: { status: 'active' },
                model: models.Discussion,
                options: {
                    limit: 100,
                    sort: { createdOn: -1 }
                },
                populate: {
                    path: 'msgs',
                    model: models.Msg,
                }
            }).execAsync().then(function (data) {
                return models.Discussion.populate(data, {
                    path: 'Notices.msgs',
                    model: models.Msg
                });
            }).then(function (data) {
                return data.Notices;
            });
    };
    var getComplaints = function (req) {
        return models.Apartment.findOne({ _id: req.session.apartment._id }).populate(
            {
                path: 'Complaints',
                match: { status: 'active' },
                model: models.Discussion,
                populate: {
                    path: 'msgs',
                    model: models.Msg
                }
            }).execAsync().then(function (data) {
                return models.Discussion.populate(data, {
                    path: 'Complaints.msgs',
                    model: models.Msg
                });
            }).then(function (data) {
                if (req.session.role == "President")
                    return data.Complaints;
                else {
                    var c = [];
                    data.Complaints.forEach(function (com) {
                        if (com.createdBy == req.session.memberid)
                            c.push(com);
                    });
                    return c;
                }

            });
    };
    var getDiscussions = function (req) {
        return models.Apartment.findOne({ _id: req.session.apartment._id }).populate({
            path: 'Discussions',
            match: { status: 'active' },
            model: models.Discussion,
            populate: {
                path: 'msgs',
                model: models.Msg
            }
        }).execAsync().then(function (data) {
            return models.Discussion.populate(data, {
                path: 'Discussions.msgs',
                model: models.Msg
            });
        }).then(function (data) {
            console.log(data);
            return data.Discussions;
        });
    };
    return {
        addDiscussion,
        editNotice,
        closeDiscussion,
        addMessage,
        getNotices,
        getComplaints,
        getDiscussions,
        deleteMessage
    };
};
module.exports = discussionController;