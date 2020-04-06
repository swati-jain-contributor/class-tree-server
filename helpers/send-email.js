const nodemailer = require('nodemailer');
let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'classtreecare@gmail.com',
    pass: 'triptajain'
  }
});

var RegistrationEmail= 
`<div style="font-size: 20px;
width: 800px;
margin-left: auto;
margin-right: auto;
padding: 20px;
background-color: #ececec;
max-width: 100%;
position: relative;">
<img src="https://raw.githubusercontent.com/swati-jain-contributor/privacy-policy/master/ct.png" style="
    position: absolute;
    top: 0;
    left: 0;
    /* width: 700px; */
">
<span style="background-color: #1e856d;
height: 36px;
top: 0;
position: absolute;
text-align:center;
color:#fff;
width: 100%;
left: 0;"><b>By learning you will teach, By teaching you will learn..</b></span>
<br/>
<br/>
Dear $name$,
<img class
<br>
<br/>
Thank you for registering for <b style="text-transform:uppercase;">$class$</b>. Your registration has been successful.
<br>
<br>
If you would like to view your class details, you can login at the following link:
<br/>
<b>www.classtree.in</b>
<br/>
<br/>
You registered with this email: $email$.
<br>
<br/>
ClassTree is a knowledge sharing platform, open to people to share their knowledge with people who are interested in learning. It’s a social platform and meant only for learning and sharing..
<br>
We encourage you to share your learnings with other and keep learning.
<br/>
<br/>
If you have any questions leading up to the class, feel free to reply to this email.
<br/>
<br/>
We look forward to seeing you in class on $date$ at $time$ IST .
<br/>
We will send you a reminder as well.
<br>
Thank you!
<br/>
<br/>
Kind Regards,
<br/>
ClassTree Staff
<br/>
classtreecare@gmail.com</div>`;

var sendEmail = function (details, type) {
  var email = RegistrationEmail;
  email = email.replace("$name$", details.name)
              .replace("$class$", details.class)
              .replace("$email$", details.studentEmail)
              .replace("$date$", details.date)
              .replace("$time$", details.time);
  let mailDetails = {
    from: 'classtreecare@gmail.com',
    to: details.studentEmail,
    subject: 'ClassTree appreciates your commitment towards learning',
    html: email
  };
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log('Error Occurs');
    } else {
      console.log('Email sent successfully');
    }
  });
}

module.exports = {
  sendEmail
};
