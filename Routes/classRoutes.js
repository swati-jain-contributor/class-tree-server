var express = require('express');
var helper = require('./helper');
var { Connection } = require("../helpers/SqlConnection");
var mailService = require('../helpers/send-email');
var helperUtils = require('../helpers/utils');
var { formatAMPM, getUserLocalDate } = helperUtils

var routes = function () {
  var classRouter = express.Router();


  classRouter.route('/addClass').post(function (req, res) {
    var sql = "INSERT INTO Class (TutorName, StartTime, EndTime, TutorEmail, Topic, Date, PhoneNo, MaxStudents, Paid, Description,TimeZone) VALUES ?";
    var req = req.body;
    var values = [
      [req.name, req.startTime, req.endTime, req.email, req.topic, req.date, req.phoneNo, req.maxStudents, false, req.description, req.timezone]
    ];

    try {

      Connection().query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
        mailService.sendAddClassEmail({
          tutorEmail: req.email,
          name: req.name,
          class: req.topic,
          date: new Date(Date.parse(req.date.replace(/-/g, '/')) - ((req.TimeZone || (-330)) * (60000))).toDateString("en-US"),
          time: formatAMPM(new Date(Date.parse(req.date.replace(/-/g, '/')) - ((req.TimeZone || (-330)) * (60000)))),
          classId: result.insertId
        });

        res.send(helper.formatSuccess(result.affectedRows));
      });

    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });

  classRouter.route('/getClasses').post(function (req, res) {
    try {
      if (req.body.type == "T")
        sql = "Select * , (select COUNT(*) from shareskill.Student where ClassId = C.id )  As Attendee from shareskill.Class As C where TutorEmail='" + req.body.email + "' order by id DESC";
      else if (req.body.type == 'C')
        sql = `SELECT C.id, C.TutorEmail,  C.MeetingLink , C.active, C.TutorName,C.StartTime, C.EndTime,C.Date,C.MaxStudents, C.Topic, C.Description,S.Email as StudentEmail ,S.Name as StudentName, S.PhoneNo as StudentPhone FROM shareskill.Class As C left join shareskill.Student As S  on C.id = S.ClassId AND (S.Email='` + req.body.email + `' or S.Email is null) order by C.id DESC`;
      else if (req.body.type == 'R')
        sql = `SELECT C.id, C.TutorEmail, C.MeetingLink ,  C.active, C.TutorName,C.StartTime, C.EndTime,C.Date,C.MaxStudents, C.Topic, C.Description,S.Email as StudentEmail ,S.Name as StudentName, S.PhoneNo as StudentPhone FROM shareskill.Class As C left join shareskill.Student As S  on C.id = S.ClassId where (S.Email='` + req.body.email + `') order by C.id DESC`;
      Connection().query(sql, [], function (err, result) {
        if(req.body.email && req.body.token){
          var updateQuery= "UPDATE shareskill.NotificationToken SET email = '$email$' WHERE Token = '$token$' and id>0";
          updateQuery = updateQuery.replace('$email$', req.body.email).replace('$token$', req.body.token);
          Connection().query(updateQuery);
        }
        if (err) throw err;
        res.send(helper.formatSuccess(result));
      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });
  classRouter.route('/bookClass').post(function (req, res) {
    try {
      var req = req.body;
      var checksql = "Select COUNT(*) as count from shareskill.Student where ClassId=" + req.classId + " and email='" + req.email + "'";
      Connection().query(checksql, function (err, result) {
        console.log(result);
        if (result[0].count == 0) {
          var sql = "INSERT INTO Student (ClassId, Email, PhoneNo, Rating, Name,TimeZone) VALUES ?";
          var values = [
            [req.classId, req.email, req.phoneNo, req.rating, req.name, req.timezone]
          ];
          Connection().query(sql, [values], function (err, result) {
            var studentId = result.insertId;
            console.log("Student id:" + studentId);
            if (err) throw err;
            var sql = "SELECT * from shareskill.Class where id = " + req.classId;
            Connection().query(sql, [], function (err, result) {
              console.log("result is" + JSON.stringify(result));
              console.log("result is" + JSON.stringify(err));
              mailService.sendEmail({
                studentEmail: req.email,
                name: req.name,
                class: result[0].Topic,
                date: new Date(Date.parse(result[0].Date.replace(/-/g, '/')) - ((req.TimeZone || (-330)) * (60000))).toDateString("en-US"),
                time: formatAMPM(new Date(Date.parse(result[0].Date.replace(/-/g, '/')) - ((req.TimeZone || (-330)) * (60000)))),
                studentId: studentId,
                classId: req.classId
              });
            });
            console.log("Number of records inserted: " + result.affectedRows);

            res.send(helper.formatSuccess(result.affectedRows));
          });
        }
        else
        res.send(helper.formatSuccess("Already booked"));
      });

    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });
  classRouter.route('/contact').post(function (req, res) {
    var sql = "INSERT INTO Feedback ( name, email, subject, message) VALUES ?";
    var req = req.body;
    var values = [
      [req.name, req.email, req.subject, req.message]
    ];
    try {
      Connection().query(sql, [values], function (err, result) {
        console.log("Number of records inserted: " + result.affectedRows);
        res.send(helper.formatSuccess(result.affectedRows));
      });
    }
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });

  return classRouter;
};

module.exports = routes;    
