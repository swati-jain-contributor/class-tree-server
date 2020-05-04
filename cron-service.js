const cron = require("node-cron");
const express = require("express");
var {Connection} = require("./helpers/SqlConnection");
var mailService = require('./helpers/send-email');
var { formatAMPM, getUserLocalDate} = require('./helpers/utils');
app = express();



cron.schedule("*/5 * * * *", function () {
  console.log("running a task every 5 minute" + new Date());

  //Send ZoomLink to all registered memebers who have class in next 6 hours
  var upcomingClasses =  `(Select id from shareskill.Class C
    where active = 1 and  
   (TIMESTAMPDIFF(HOUR,UTC_TIMESTAMP(),C.date) <6) AND (C.date >UTC_TIMESTAMP()))`;
  var studentEmailStatus= `(Select Count(*) from EmailDetails where ClassId=CL.id and StudentId= S.id and Type = 'CLASS_JOINING_DETAILS')=0`;
  var teacherEmailStatus =`(Select Count(*) from EmailDetails where ClassId=CL.id and StudentId is null and Type = 'CLASS_JOINING_DETAILS')=0`;
  var sql = `( 
    Select S.id as studentId , CL.id as classId , CL.Topic,CL.Date,  Name, MeetingLink, Email, S.TimeZone from Student as S cross join Class as CL on S.ClassId = CL.id
   where S.ClassId IN (`+upcomingClasses+`)
 and `+studentEmailStatus+`
 )
    UNION ALL
    
    (
    Select null, CL.id as classId , CL.Topic,CL.Date, TutorName as Name, CL.MeetingLink,CL.TutorEmail as Email, CL.TImeZone  
 from Class CL where id in (`+upcomingClasses+`)
 and `+teacherEmailStatus+` 
 )`;
  try {
    Connection().query(sql, [], function (err, result) {
      if(!err && result.length>0){
        for(i=0;i<result.length;i++){
          mailService.sendJoiningEmail({
            studentEmail:result[i].Email,
            name: result[i].Name,
            topic: result[i].Topic,
            date: new Date( Date.parse(result[i].Date.replace(/-/g, '/')) - ((result[i].TimeZone)*(60000))).toDateString("en-US"),
            time: formatAMPM(new Date( Date.parse(result[i].Date.replace(/-/g, '/')) - ((result[i].TimeZone)*(60000)))),
            studentId: result[i].studentId,
            classId:result[i].classId,
            meeting:result[i].MeetingLink
          });
        }
      }
    });

  }
  catch (ex) {
    res.send(helper.formatFailure("Failed"));
  }

});

app.listen(3128, function () {
  console.log('Gulp is running my app on  PORT: ' + 3128);
});
