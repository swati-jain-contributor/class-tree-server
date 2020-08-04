var express = require('express');
var helper = require('./helper');
var { Connection } = require("../helpers/SqlConnection");
var mailService = require('../helpers/send-email');
var helperUtils = require('../helpers/utils');
var { formatAMPM, getUserLocalDate } = helperUtils


var createSession = (req, res) => {
  var session = "INSERT INTO session (sessionid,active, timezone,registeredon,referrer,history,browsername,browserversion,platform,language,screenwidth,screenheight) VALUES ?";
  var newsessionid = (new Date().getTime().toString() + Math.floor(Math.random() * 101).toString());
  let data = req.body;
  var values = [
    [newsessionid, 1,data.timezone,data.registeredon,data.referrer,data.history,data.browsername,data.browserversion,data.platform,data.language,data.screenwidth,data.screenheight ]
  ];
  try {
    Connection().query(session, [values], function (err, result) {
      console.log(result);
      console.log(err);
      res.cookie("SESSION_ID", newsessionid, { maxAge: 90000000000, secure: false });
      res.send(helper.formatSuccess(newsessionid));
    });
  }
  catch (ex) {

  }
};
var routes = function () {
  var sessionRouter = express.Router();
  sessionRouter.route('/getUserData').post(function (req, res) {
    if (req.cookies['SESSION_ID']) {
      let sessionid = req.cookies['SESSION_ID'];
      let userquery = "Select * from user where userid = (select userid from session where sessionid = '" + sessionid + "' and active=1)";
      try {
        Connection().query(userquery, [], function (err, result) {
          if (result && result.length > 0) {
            res.send(helper.formatSuccess(result[0]));
          }
          else {
            console.log(err);
            res.send(helper.formatSuccess(req.cookies['SESSION_ID']));
          }
        });
      }
      catch (ex) {

      }

    }
    else {
      createSession(req, res);
    }
  });

  sessionRouter.route('/createAccount').post(function (req, res) {
    console.log("Cookiies");
    var sessionid = req.cookies['SESSION_ID'];
    var sql = "INSERT INTO user ( username, email, password, firstname,lastname, country, timezone,registeredon,mobile,referrer,history,browsername,browserversion,platform,language,screenwidth,screenheight) VALUES ?";
    var req = req.body;
    var values = [
      [req.email, req.email, req.password, req.firstname, req.lastname, req.country, req.timezone, req.registeredon, req.mobile,req.referrer,req.history,req.browsername,req.browserversion,req.platform,req.language,req.screenwidth,req.screenheight]
    ];
    try {
      Connection().query(sql, [values], function (err, result) {
        if (result && result.affectedRows > 0) {
          var createUser = "Update session SET  userid = " + result.insertId + ", active = 1 where sessionid='" + sessionid + "'";
          try {
            Connection().query(createUser, [], function (err, result) {
              if (result && result.affectedRows > 0) {
                res.send(helper.formatSuccess(req));
              }
              else {
                console.log(err);
                res.send(helper.formatFailure("Failed"));
              }
            });
          }
          catch (ex) {
            res.send(helper.formatFailure("Failed"));
          }
        }
        else {
          console.log(err);
          res.send(helper.formatFailure("Email already registered"));
        }

      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });
  sessionRouter.route('/login').post(function (req, res) {
    var sql = "Select * from user where email='" + req.body.email + "' and password='" + req.body.password + "'";

    console.log(sql);
    try {
      Connection().query(sql, [], function (err, result) {
        console.log(result);
        console.log(err);
        if (result.length > 0) {
          var loginUser = "Update session SET  userid = '" + result[0].userid + "' , active = 1 where sessionid=" + req.cookies['SESSION_ID'];
          try {
            Connection().query(loginUser, [], function (err, result2) {
              if (result2.affectedRows > 0) {
                res.send(helper.formatSuccess(result[0]));
              }
              else {
                res.send(helper.formatFailure("Invalid credentials456"));
              }
            });
          }
          catch (ex) {
            res.send(helper.formatFailure("Invalid credentials123"));
          }
        }
        else {
          res.send(helper.formatFailure("Invalid credentials"));
        }

      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Invalid credentials"));
    }
  });
  sessionRouter.route('/logout').post(function (req, res) {
    var sql = "Update session SET  active = 0 where sessionid='" + req.cookies['SESSION_ID'] + "'";
    try {
      Connection().query(sql, [], function (err, result) {
        console.log("Number of records inserted: " + result.affectedRows);
        res.clearCookie("SESSION_ID");
        res.send(helper.formatSuccess("success"));
      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });


  sessionRouter.route('/forgotpassword').post(function (req, res) {

  });
  return sessionRouter;
};

module.exports = routes;    
