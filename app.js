var express = require('express'),
    bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


var app = express();
app.use(cookieParser());
var port = process.env.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var classRouter = require('./Routes/classRoutes')();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});
 app.use('/api/classes', classRouter);

app.listen(port, function () {
    console.log('Gulp is running my app on  PORT: '+port);
});

module.exports = app;
