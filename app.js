var express = require('express'),
    bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var app = express();
app.use(cookieParser());
var port = process.env.port || 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var classRouter = require('./Routes/classRoutes')();
var videoRouter = require('./Routes/videoRoutes')();
var notificationRouter = require('./Routes/notificationRoutes')();
var contactRouter = require('./Routes/contactRoutes')();
var sessionRouter = require('./Routes/sessionRoutes')();

app.use(function (req, res, next) {
    console.log(req);
    res.header("Access-Control-Allow-Origin", "http://bakeminds.com");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});
app.use('/api/classes', classRouter);
app.use('/api/video', videoRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/contact', contactRouter);
app.use('/api/session', sessionRouter);

app.listen(port, function () {
    console.log('Gulp is running my app on  PORT: '+port);
});

module.exports = app;
