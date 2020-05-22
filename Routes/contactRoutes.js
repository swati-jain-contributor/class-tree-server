var express = require('express');
var helper = require('./helper');
var { Connection } = require("../helpers/SqlConnection");
var mailService = require('../helpers/send-email');
var helperUtils = require('../helpers/utils');
var { formatAMPM, getUserLocalDate } = helperUtils

var routes = function () {
  var contactRouter = express.Router();

  contactRouter.route('/addcontacts').post(function (req, res) {
    var sql = "INSERT INTO `shareskill`.`Contacts` ( `Name`,`Phone`,`Token`) VALUES ?";
    var req = req.body;
    console.log(req.body);
    var values = [req.body];

    res.send(helper.formatSuccess(0));
    // try {
    //   Connection().query(sql, [values], function (err, result) {
    //     if (err) throw err;
    //     console.log("Number of records inserted: " + result.affectedRows);
    //     res.send(helper.formatSuccess(result.affectedRows));
    //   });
    // }
    // catch (ex) {
    //   res.send(helper.formatFailure("Failed"));
    // }
  });

  return contactRouter;
};

module.exports = routes;    
