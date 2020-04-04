//var session = require('../models/sessionModel');
var models = require('../models/aptModel');
var notification = require('../helpers/notification-service');
var apartmentController = function (Apartment) {

    var createNewApartment = function (req) {

        var apartment = new models.Apartment();
        apartment.name = req.body.aptname;
        apartment.address = req.body.address;
        apartment.city = req.body.city;
        apartment.state = req.body.state;
        apartment.country = req.body.country;
        apartment.zip = req.body.zip;
        apartment.aptFunds.currentBalance = req.body.initialBalance;
        return apartment.saveAsync().then(function (data) {
            var member = new models.Member();
            member.role = "President";
            member.status = "active";
            member.phone = req.body.phone;
            member.password = req.body.password;
            member.name = req.body.name;
            member.flat = req.body.flat;
            member.block = req.body.block;
            member.family = req.body.family;
            member.username = data._id + "-" + member.phone;
            member.memberId = member.phone;
            member.isVerified = false;
            member.otp = Math.floor(1000 + Math.random() * 9000);
            member.otpTime = new Date();
            return member.saveAsync()
        }).then(function (data) {
            console.log(data);
            apartment.members.push(data.id);
            apartment.createdBy = data.id;
            apartment.updatedBy = data.id;
            return apartment.saveAsync();
        }).then(function (apt) {
            console.log(apt);
            return apt;
        }).catch(function (err) {
            console.log(err);
            return err;
        });


    }
    var verifyCredentials = function (req) {
        if (req.type == "L") {
            var aptId = req.username.split('-')[0];
            console.log("APt Id-" + aptId);
            return Apartment.findOne({ _id: aptId }).populate("members")
                .execAsync().then(function (data) {                    
                    var s = data.members.find(function (arr) {                        
                        if (arr.username == req.username && arr.otp == req.otp) {
                            arr.isVerified = true;
                            arr.saveAsync();
                            return arr;
                        }
                    });                    
                    return s;
                });
        }
        else {
            return models.Request.findOne({ _id: req.body.requestId }).populate("member").execAsync().then(function (data) {
                if (data.member != null && data.member.otp == req.body.otp) {
                    var mem = data.member;
                    mem.isVerified = true;
                    mem.saveAsync();
                    notification.sendMessageToPresident("REQUEST_JOIN_APT", data.aptId, data)
                    return data;
                }
                else if (data.member != null)
                    throw ("Invalid credentials");
                else
                    throw ("Request not found");
            });
        }
    }
    var getApartmentAddress = function (req) {
        return Apartment.findOne({ _id: req.body.id }).execAsync().then(function (data) {
            if (data)
                return data;
            else
                throw ("Apartment Not Found");
        });
    }
    var saveOTP = function (req) {
        console.log("On OTP");
        // console.log(req);        
        if (req.body.type == "L") {
            var aptId = req.body.username.split('-')[0];
            return Apartment.findOne({ _id: aptId }).populate({
                path: 'members',
                match: { username: req.body.username },
                model: models.Member,
            }).execAsync().then(function (data) {
                var otp = Math.floor(1000 + Math.random() * 9000);
                console.log("otp is" + otp);
                console.log(data);
                if(data==null)
                    throw("Invalid Apartment Id");
                if (data.members.length > 0) {
                    var mem = data.members[0];
                    mem.otp = otp;
                    mem.otpTime = new Date();
                    mem.saveAsync();
                    return {
                        phone:mem.phone,
                        otp:otp                        
                    };
                }
                else
                    throw ("Member not found");
            });
        }
        else
            return models.Request.findOne({ _id: req.body.requestId }).populate("member").execAsync().then(function (data) {
                var otp = Math.floor(1000 + Math.random() * 9000);
                console.log(otp);
                console.log(data);
                if (data.member != null) {
                    var mem = data.member;
                    mem.otp = otp;
                    mem.otpTime = new Date();
                    mem.saveAsync();
                    return {
                        phone:mem.phone,
                        otp:otp                        
                    };
                }
                else
                    throw ("Request not found");
            });
    }
    var validatePhoneRequest = function (req) {
        return models.Apartment.findOne({ _id: req.body.aptId })            
            .populate({
                path: 'members',
                match: { phone: req.body.phone,
                    status: 'active'
                 }
            })
            .exec().then(function (data) {                
                if (data.members.length > 0)
                    return false;
                else
                    return true;
            });
    }
    var validateFLatRequest = function (req) {
        console.log(req.body.flat);
        console.log(req.body.block);
        return models.Apartment.findOne({ _id: req.body.aptId })                       
            .populate({
                path: 'members',
                match: {
                    flat: req.body.flat,
                    block: req.body.block,
                    status: 'active'
                }
            })            
            .exec().then(function (data) {
                console.log("Flat-data");                
                if (data.members.length > 0)
                    return false;
                else
                    return true;
            });
    }
    var createNewRequest = function (req) {
        var apartment;
        var request;
        var mem;
        return validatePhoneRequest(req).then(function (data) {
            if (data)
                return validateFLatRequest(req);
            else
                throw "Phone already registered with another Member";
        }).then(function (data) {
            if (data)
                return models.Apartment.find({ _id: req.body.aptId }).exec()
            else
                throw "Flat already registered with another Member";
        })
            .then(function (data) {
                if (data) {
                    apartment = data[0];
                    request = new models.Request();
                    request.aptId = req.body.aptId;
                    request.type = "JOIN_APT";
                    request.createdOn = new Date();
                    request.createdBy = req.body.phone;
                    request.status = "pending";
                    return request.saveAsync()
                }
                else
                    throw ("Apartment not found.");
            })
            .then(function (data) {
                console.log("Request Created");
                mem = new models.Member();
                mem.username = req.body.aptId + "-" + req.body.phone;
                mem.role = "Resident";
                mem.status = "inactive";
                mem.phone = req.body.phone;
                mem.name = req.body.name;
                mem.flat = req.body.flat;
                mem.block = req.body.block;
                mem.family = req.body.family;
                mem.memberId = mem.phone;
                mem.isVerified = false;
                var otp = Math.floor(1000 + Math.random() * 9000);
                mem.otp = otp;
                mem.otpTime = new Date();
                return mem.saveAsync();
            }).then(function (data) {
                console.log("Member Created");
                request.member = data;
                request.saveAsync();
            }).then(function (data) {
                console.log("Member added to request");
                console.log(apartment);
                apartment.requests.push(request);
                return apartment.saveAsync();
            }).then(function (data) {
                console.log("Request added to Apartment");
                return request;
            });
    }
    return {
        createNewApartment: createNewApartment,
        verifyCredentials: verifyCredentials,
        saveOTP: saveOTP,
        getApartmentAddress: getApartmentAddress,
        createNewRequest: createNewRequest
    }
}

module.exports = apartmentController;