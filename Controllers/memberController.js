var session = require('../models/sessionModel');
var models = require('../models/aptModel');
var notification = require('../helpers/notification-service');
var memberController = function (Member) {
    var getAllMembers = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'members',
                match: { status: 'active' },
                model: models.Member,
                populate: {
                    path: 'vehicles',
                    model: models.Vehicle
                }
            }).execAsync()
            .then(function (data) {
                console.log("First Data");
                return models.Member.populate(data, {
                    path: 'members.vehicles',
                    model: models.Vehicle
                });
            })
            .then(function (data) {

                return data.members;
            });
    };
    var validateSecretary = function (req) {        
        return models.Apartment.findOne({ _id: req.session.aptId  })            
            .populate({
                path: 'members',
                match: { status: 'active', role: "President" },
                model: models.Member,
            }).exec().then(function (data) {                              
                if(data.members.length>1)
                    return true;
                else
                    return false;
            });
    }
    var addMember = function (req) {
        var member = new models.Member();
        member.role = req.body.role;
        member.status = "active";
        member.phone = req.body.phone;
        member.password = 'password';
        member.name = req.body.name;
        member.flat = req.body.flat;
        member.block = req.body.block;
        member.username = req.session.apartment._id + "-" + member.phone;
        member.memberId = member.phone;
        member.family = req.body.family;
        member.vehicles = [];
        return member.saveAsync().then(function (data) {
            console.log(data);
            req.body.vehicles.map(v => {
                var vehicle = new models.Vehicle({
                    vehicleNo: v.vehicleNo,
                    vehicleType: v.vehicleType
                });
                vehicle.saveAsync().then(function (data) {
                    console.log("Vehicle Id:" + data._id);
                    member.vehicles.push(data._id);
                    member.save();
                });
            });
            var apt = req.session.apartment;
            apt.members.push(data._id);
            apt.updatedBy = data._id;
            return apt.saveAsync();
        }).then(function (data) {
            return member;
        });
    }
    var editMember1=function(req){         
        var member = req.session.member;
        member.password = 'password';
        member.role = req.body.role;
        member.name = req.body.name;
        member.flat = req.body.flat;
        member.block = req.body.block;
        member.username = req.session.apartment._id + "-" + member.phone;
        member.memberId = member.phone;
        member.family = req.body.family;
        member.vehicles = [];
        return Promise.all(req.body.vehicles.map(v => {
            var vehicle = new models.Vehicle({
                vehicleNo: v.vehicleNo,
                vehicleType: v.vehicleType
            });
            return vehicle.saveAsync().then(function (data) {
                member.vehicles.push(vehicle._id);
            });
        })).then(function () {
            return member.saveAsync().then(function (data) {
                console.log(data);
                return member;
            });
        });
    }
    var updateSession=function(req){
        session.find({
            "memberid":req.body.id,
            "status":"active"
        }).exec().then(function(data){
            console.log("Session");
            console.log(data);
            data.forEach(m=>{
                m.role=req.body.role;
                console.log(m.role);
                m.saveAsync();
            });
        })
    }
    var editMember = function (req) {     
        if (req.body.role == "Resident" && req.body.role != req.session.member.role) {                  
            return validateSecretary(req).then(function(data){
                if(data){
                    updateSession(req);
                    return editMember1(req); 
                }                    
                else 
                    throw "Apartment should have at least one secretary";                             
            })
        }
        else{   
            if(req.body.role != req.session.member.role) 
                updateSession(req);
            return editMember1(req);
        }                
    }
    var deleteSession=function(req){
        session.find({
            "memberid":req.session.member._id,
            "status":"active"
        }).exec().then(function(data){
            data.forEach(m=>{
                m.status="inactive";
                m.saveAsync();
            });
        })
    }
    var deleteMember = function (req) {
        var m = req.session.member;
        m.status = "inactive";
        deleteSession(req);
        return m.saveAsync().then(function (data) {
            return true;
        });
    }
    var getAllRequest = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'requests',
                match: { status: 'pending' },
                model: models.Request,
                populate: {
                    path: 'member',
                    model: models.Member,
                    match: { isVerified: true },
                }
            }).execAsync()
            .then(function (data) {
                console.log("First Data");
                return models.Request.populate(data, {
                    path: 'requests.member',
                    model: models.Member
                });
            })
            .then(function (data) {
                return data.requests.filter(req => req.member != null);
            });
    }
    var approveRequest = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'requests',
                match: { _id: req.body.requestId },
                model: models.Request,
                populate: {
                    path: 'member',
                    model: models.Member
                }
            }).execAsync()
            .then(function (data) {
                console.log("First Data");
                return models.Member.populate(data, {
                    path: 'requests.member',
                    model: models.Member
                });
            }).then(function (data) {
                var request = data.requests[0];
                request.status = "Approved";
                request.member.status = "active";
                session.findOne({
                    aptId: req.session.aptId,
                    memberid: request.member._id,
                    userId: request.member.phone
                }).execAsync().then(function (data) {
                    console.log(data);
                    data.authenticationStatus = true;
                    data.saveAsync();
                    notification.sendMessageToMembers("REQUEST_APPROVED", request.aptId, [request.member._id], data, req.session.userId)
                });
                request.member.saveAsync();
                request.saveAsync();
                data.members.push(request.member);
                data.saveAsync();
                return request.member;
            });
    }
    var cancelRequest = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'requests',
                match: { _id: req.body.requestId },
                model: models.Request,
            }).execAsync().then(function (data) {
                var req = data.requests[0];
                req.status = "Declined";
                req.saveAsync();
                return "Declined";
            });
    }
    var sendAlarm = function (req) {
        if (req.body.type == "EMERGENCY") {
            notification.sendMessageToAllApartmentMembers("EMERGENCY_ALARM", req.session.aptId, req.session.member, undefined, req.session.userId);
            return "SUCCESS";
        }
        else
            return "FAILURE";
    }    
    return {
        addMember,
        editMember,
        deleteMember,
        getAllMembers,
        getAllRequest,
        approveRequest,
        cancelRequest,
        sendAlarm
    }
}

module.exports = memberController;