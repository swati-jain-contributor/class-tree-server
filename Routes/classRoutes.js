var express = require('express');
var helper = require('./helper');
var mysql = require('mysql');

var routes = function (Class) {
    var classRouter = express.Router();

    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "shareskill"
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });

    classRouter.route('/addClass').post(function (req, res) {
      var sql = "INSERT INTO Class (TutorName, StartTime, EndTime, TutorEmail, Topic, Date, PhoneNo, MaxStudents, Paid, Description) VALUES ?";
      var req= req.body;
      var values = [
        [req.name,req.startTime,req.endTime, req.email,req.topic, req.date, req.phoneNo, req.maxStudents, false, req.description]
      ];

      try{

        con.query(sql, [values], function (err, result) {
          if (err) throw err;
          console.log("Number of records inserted: " + result.affectedRows);
          res.send(helper.formatSuccess(result.affectedRows));
        });

      }
       catch(ex){
          res.send(helper.formatFailure("Failed"));
       }   
    });

    classRouter.route('/getClasses').post(function (req, res) { 
      try{
        if(req.body.type=="T")
          sql="Select * , (select COUNT(*) from shareskill.student where ClassId = C.id )  As Attendee from shareskill.Class As C where TutorEmail='"+req.body.email+"' order by id DESC";
        else
          sql=`SELECT C.id, C.TutorName,C.StartTime, C.EndTime,C.Date,C.MaxStudents, C.Topic, C.Description,S.Email as StudentEmail ,S.Name as StudentName, S.PhoneNo as StudentPhone FROM shareskill.Class As C left join shareskill.Student As S  on C.id = S.ClassId 
          where S.Email='`+ req.body.email+`' or S.Email is null order by C.id`;
        con.query(sql, [], function (err, result) {
          if (err) throw err;
          res.send(helper.formatSuccess(result));
        });
      }
       catch(ex){
          res.send(helper.formatFailure("Failed"));
       }  
    });
    classRouter.route('/bookClass').post(function (req, res) {
      var sql = "INSERT INTO Student (ClassId, Email, PhoneNo, Rating, Name) VALUES ?";
      var req= req.body;
      var values = [
        [req.classId,req.email,req.phoneNo, req.rating,req.name]
      ];

      try{

        con.query(sql, [values], function (err, result) {
          if (err) throw err;
          console.log("Number of records inserted: " + result.affectedRows);
          res.send(helper.formatSuccess(result.affectedRows));
        });

      }
       catch(ex){
          res.send(helper.formatFailure("Failed"));
       }  
    });

    return classRouter;
};

module.exports = routes;    
