var express = require('express');
var helper = require('./helper');
var { Connection } = require("../helpers/SqlConnection");
var mailService = require('../helpers/send-email');
var helperUtils = require('../helpers/utils');
var { formatAMPM, getUserLocalDate } = helperUtils

var routes = function () {
  var notificationRouter = express.Router();

  notificationRouter.route('/registerToken').post(function (req, res) {
    var sql = "INSERT INTO `shareskill`.`NotificationToken` ( `DeviceId`,`Token`,`Model`,`Cordova`,`Platform`,`Version`) VALUES ?";
    var req = req.body;
    var values = [
      [req.deviceId, req.token, req.model, req.cordova, req.platform, req.version]
    ];

    try {
      Connection().query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        res.send(helper.formatSuccess(result.affectedRows));
      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });

  return notificationRouter;
};

module.exports = routes;    
