var express = require('express'),
    // mongoose = require('mongoose'),
    // autoIncrement = require('mongoose-auto-increment'),
    bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Promise = require("bluebird");
var helper=require("./Routes/helper");
var mysql = require('mysql');

//  Promise.promisifyAll(mongoose);
var val="1";

var db;
if (process.env.ENV == 'Test') {
    // db = mongoose.connect('mongodb://localhost/societyAPI_test');
    // val=2;
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: ""
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });
}
else {    
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
    //db = mongoose.connect('mongodb://scietyapi:myUDfh66JFWrao2fscdW5Ab5CarFzcFipEzHlYCWDPXul2tn4jzlBRCVc8ya51FDR6AXF0eJrxAvRZosOpoJPQ==@scietyapi.documents.azure.com:10255/?ssl=true');
    // db = mongoose.connect('mongodb://localhost/societyAPI');
    // val=3;
}
// autoIncrement.initialize(db);
// val=4;
// var Session = require('./models/sessionModel');
// var models = require('./models/aptModel');

var app = express();
app.use(cookieParser());
var port = process.env.port || 3000;

// //console.log(port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var classRouter = require('./Routes/classRoutes')();
// apartmentRouter = require('./Routes/apartmentRoutes')(models.Apartment);
// memberRouter = require('./Routes/memberRoutes')(models.Apartment);
// vendorRouter = require('./Routes/vendorRoutes')(models.Apartment);
// accountRouter = require('./Routes/accountRoutes')(models.Apartment);
// discussionRouter = require('./Routes/discussionRoutes')(models.Apartment);

app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "X-Requested-With,auth-token");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});
 app.use('/api/classes', classRouter);
// app.use('/api/apartments', apartmentRouter);
// app.use(function(req,res,next){
//      Session.findOneAsync({ 'authCode': req.headers["auth-token"]}).then(function(data){
//          if(data !=null && data.authenticationStatus){
//              req.session=data;
//              models.Apartment.findOne({ _id: data.aptId }).exec().then(function(data){
//                  req.session.apartment=data;
//                  next();
//              });
//          }
//          else{
//              res.send(helper.formatFailure("User is not authenticated"));
//          }                  
//      });    
// });

// app.use('/api/members', memberRouter);
// app.use('/api/vendors', vendorRouter);
// app.use('/api/accounts', accountRouter);
// app.use('/api/discussions', discussionRouter);

// app.get('/', function (req, res) {
//     res.send('welcome to my sessionAPI!');
// });

app.listen(port, function () {
    console.log('Gulp is running my app on  PORT: '+port);
});

module.exports = app;
