var gcm = require('node-gcm');
var models = require('../models/aptModel');
var sender = new gcm.Sender('AAAAnUKAD1M:APA91bFBiCDI9FjmYTMOpe3fAB3El7IDWnn1Fh7Gy4XB8pNITs5BFyVelyRy-61mAQr8w4nI0s-Wvmhxqe8iMxm2O-Twcx1PGz1djDR8gm5e87iVmxxQB5xhzvaAf0-n0frIrLujWuhR');
var createChatMsg = function (event, msg, group, sendBy) {
    var title = "";
    if (group) {
        if (group.type == "N")
            title = "New notice added.";
        else if (group.type == "D")
            title = msg.msg.sender + " message in " + group.title;
        else
            title = "Reply received on complaint " + group.title;
    }
    else {
        if (event == "REQUEST_JOIN_APT")
            title = "New request for joining apartment";
        else if (event == "REQUEST_APPROVED")
            title = "Request Approved";
        else if (event == "EMERGENCY_ALARM") {
            title = msg.name + "[" + msg.flat + "-" + msg.block + "] needs your help. Help him.";
            msg = {
                name: msg.name,
                flat: msg.flat,
                block: msg.block,
                id: msg._id,
                phone: msg.phone,
                role: msg.role
            }
        }

    }
    msg.sendBy = sendBy;
    console.log("Sending msg:");
    console.log(title);
    console.log(msg);
    var message = new gcm.Message({
        collapse_key:title,
        priority: 'normal',
        contentAvailable: true,
        delayWhileIdle: true,
        data: {
            event,
            message: msg
        },
        notification: {
            title: title,
            icon: "",
            body: title,
            sound:"default",
            tag:title,
            color:'#129A86'
        }
    });
    return message;
};
var sendMessageToAllApartmentMembers = function (event, aptId, msg, group, sendBy) {
    var message = createChatMsg(event, msg, group, sendBy);
    models.Apartment.findOne({ _id: aptId })
        .populate({
            path: 'members',
            match: { status: 'active' },
            model: models.Member,
        }).execAsync().then(function (data) {
            console.log("Total Members:" + data.members.length);
            var mem = data.members.map(m => {   
                console.log(m.memberId+":"+sendBy);

                if (m.memberId != sendBy) {
                    console.log("Send Message to:" + '/topics/' + m.username);
                    sender.send(message, { topic: '/topics/' + m.username }, function (err, response) {
                        if (err) console.error(err);
                        else {
                            console.log("Response:");
                            console.log(response);
                        }
                    });
                }
            });
        });
};
var sendMessageToPresident = function (event, aptId, msg, group, sendBy) {
    console.log("president");
    var message = createChatMsg(event, msg, group, sendBy);
    models.Apartment.findOne({ _id: aptId })
        .populate({
            path: 'members',
            match: { role: "President" },
            model: models.Member,
        }).execAsync().then(function (data) {
            if (data.members.length > 0)
                var mem = data.members.map(m => {
                    if (m.memberId != sendBy) {
                        console.log("Send Message to:" + '/topics/' + m.username);
                        sender.send(message, { topic: '/topics/' + m.username }, function (err, response) {
                            if (err) console.error(err);
                            else console.log(response);
                        });
                    }
                });
        });
};
var sendMessageToMembers = function (event, aptId, members, msg, group, sendBy) {
    console.log("members");
    console.log(members);
    var message = createChatMsg(event, msg, group, sendBy);
    models.Apartment.findOne({ _id: aptId })
        .populate({
            path: 'members',
            match: { _id: { $in: members } },
            model: models.Member,
        }).execAsync().then(function (data) {
            console.log("Members:" + data.members.length);
            if (data.members.length > 0)
                var mem = data.members.map(m => {
                    if (m.memberId != sendBy) {
                        console.log("Send Message to:" + '/topics/' + m.username);
                        sender.send(message, { topic: '/topics/' + m.username }, function (err, response) {
                            if (err) console.error(err);
                            else console.log(response);
                        });
                    }
                });
        });
};

module.exports = {
    sendMessageToAllApartmentMembers,
    sendMessageToPresident,
    sendMessageToMembers
}
