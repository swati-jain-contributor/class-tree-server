const nodemailer = require('nodemailer');
let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'classtreecare@gmail.com',
    pass: 'triptajain'
  }
});
var {Connection} = require("./SqlConnection");
var AddClassEmail = require("./addClassEmail");
var RegistrationEmail= require("./registrationEmail");
var joiningEmail = require('./joiningEmail');

var logEmail = function (type,studentId,classId){
  var sql = "INSERT INTO `shareskill`.`EmailDetails` (`Media`, `Type`, `StudentId`, `ClassId`) VALUES ?";
      var values = [
        ["Email", type,studentId, classId]
      ];
      Connection().query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
}
var sendEmail = function (details, type) {
  var email = RegistrationEmail;
  email = email.replace("$name$", details.name)
              .replace("$topic$", details.class)
              .replace("$email$", details.studentEmail)
              .replace("$date$", details.date)
              .replace("$time$", details.time);
  let mailDetails = {
    from: 'classtreecare@gmail.com',
    to: details.studentEmail,
    subject: 'BakeMinds appreciates your commitment towards learning',
    html: email
  };
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs');
      console.log(err);
    } else {
      console.log('Email sent successfully');
      logEmail("CLASS_BOOKED",details.studentId, details.classId);
    }
  });
}


var sendJoiningEmail =function(details,type) {
  var email = joiningEmail;
  email = email.replace("$name$", details.name)
              .replace("$topic$", details.topic)
              .replace("$email$", details.studentEmail)
              .replace("$date$", details.date)
              .replace("$time$", details.time)
              .replace("$meeting$", details.meeting)
              .replace("$meeting$", details.meeting)
              .replace("$meeting$", details.meeting)
              .replace("$meeting$", details.meeting)
              ;
  let mailDetails = {
    from: 'classtreecare@gmail.com',
    to: details.studentEmail,
    subject: 'BakeMinds Live Class - '+ details.topic,
    html: email
  };
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(mailDetails);
      console.log(err);
      console.log('Error Occurs');
    } else {
      console.log('Email sent successfully');
      logEmail("CLASS_JOINING_DETAILS",details.studentId, details.classId);
    }
  });
}

var sendAddClassEmail = function (details, type) {
  var email = AddClassEmail;
  email = email.replace("$name$", details.name)
              .replace("$topic$", details.class)
              .replace("$email$", details.tutorEmail)
              .replace("$date$", details.date)
              .replace("$time$", details.time);
  let mailDetails = {
    from: 'classtreecare@gmail.com',
    to: details.tutorEmail,
    subject: 'BakeMinds appreciates your commitment towards teaching',
    html: email
  };
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs');
    } else {
      console.log('Email sent successfully');
      logEmail("CLASS_ADDED",null, details.classId);
    }
  });
}
module.exports = {
  sendEmail,
  sendJoiningEmail,
  sendAddClassEmail
};
