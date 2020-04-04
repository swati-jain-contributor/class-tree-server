var models = require('../models/aptModel');
var vendorController = function (Vendor) {
    var getAllVendors = function (req) {
        return models.Apartment.findOne({ _id: req.session.aptId })
            .populate({
                path: 'vendors',
                match: { status: 'active' },
                model: models.Vendor,
            }).execAsync()
            .then(function (data) {
                return data.vendors;
            });
    }
    var addVendor = function (req) {
        var vendor = new models.Vendor();
        vendor.vendorName = req.body.vendorName;
        vendor.category = req.body.category;
        vendor.vendorPhone = req.body.vendorPhone;
        vendor.likes = 0;
        vendor.dislikes = 0;
        vendor.likeBy = '';
        vendor.dislikeBy = '';
        vendor.status = 'active';
        console.log("addedBy:"+req.session.name);
        vendor.addedBy = req.session.name;
        vendor.createdBy = req.session.userId;

        return vendor.saveAsync().then(function (data) {
            console.log(data);
            var apt = req.session.apartment;
            apt.vendors.push(data._id);
            apt.updatedBy = req.session.userId;
            return apt.saveAsync();
        }).then(function (data) {
            return vendor;
        });
    }
    var editVendor = function (req) {
        var vendor = req.session.vendor;
        vendor.vendorName = req.body.vendorName;
        vendor.category = req.body.category;
        vendor.vendorPhone = req.body.vendorPhone;
        vendor.likes = 0;
        vendor.dislikes = 0;
        vendor.likeBy = '';
        vendor.dislikeBy = '';
        vendor.status = 'active';
        vendor.addedBy = req.session.name;
        vendor.createdBy = req.session.userId;

        return vendor.saveAsync().then(function (data) {
            console.log(data);
            return vendor;
        });
    }
    var deleteVendor = function (req) {
        var v = req.session.vendor;
        v.status = "inactive";
        return v.saveAsync().then(function (data) {
            return true;
        });
    }
    var likeVendor = function (req) {
        var v = req.session.vendor;
        if(v.dislikeBy.indexOf(','+req.session.userId+',')>-1){
            v.dislikeBy=v.dislikeBy.replace(','+req.session.userId+',','');
            v.dislikes--;
        }
        if(v.likeBy.indexOf(','+req.session.userId+',')>-1){
            v.likeBy=v.likeBy.replace(','+req.session.userId+',','');
            v.likes--;
        }
        else{
            v.likeBy=v.likeBy+ ','+req.session.userId+',','';
            v.likes++;
        }
        return v.saveAsync().then(function (data) {
            return true;
        });
    }
    var dislikeVendor = function (req) {
        var v = req.session.vendor;
        if(v.likeBy.indexOf(','+req.session.userId+',')>-1){
            v.likeBy=v.likeBy.replace(','+req.session.userId+',','');
            v.likes--;
        }
        if(v.dislikeBy.indexOf(','+req.session.userId+',')>-1){
            v.dislikeBy=v.dislikeBy.replace(','+req.session.userId+',','');
            v.dislikes--;
        }
        else{
            v.dislikeBy=v.dislikeBy+ ','+req.session.userId+',','';
            v.dislikes++;
        }
        return v.saveAsync().then(function (data) {
            return true;
        });
    }
    return {
        addVendor,
        editVendor,
        deleteVendor,
        likeVendor,
        dislikeVendor,
        getAllVendors
    }
}

module.exports = vendorController;