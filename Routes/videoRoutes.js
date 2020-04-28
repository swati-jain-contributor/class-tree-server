var express = require('express');
var helper = require('./helper');
var { Connection } = require("../helpers/SqlConnection");
var mailService = require('../helpers/send-email');
var helperUtils = require('../helpers/utils');
var axios = require('axios').default;
var { formatAMPM, getUserLocalDate } = helperUtils;
var https = require('https');
var fs = require('fs');
var OpenVidu = require('openvidu-node-client').OpenVidu;
var Session = require('openvidu-node-client').Session;

var routes = function () {
  var videoRouter = express.Router();
  // var OPENVIDU_SERVER_URL = 'https://' + 'localhost' + ':4443';
  var OPENVIDU_SERVER_URL = 'http://classtree.in:5443';
  var OPENVIDU_SERVER_SECRET = 'MY_SECRET'

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // (NOTE: this will disable client verification)
    cert: fs.readFileSync("openviducert.pem"),
    key: fs.readFileSync("openvidukey.pem"),
    passphrase: "YYY"
  })

  var OV = new OpenVidu(OPENVIDU_SERVER_URL, OPENVIDU_SERVER_SECRET);

  var generateToken = (sessionId, role, name) => {
    return axios.post(OPENVIDU_SERVER_URL + '/api/tokens', {
      "session": sessionId, "role": role, "data": name.toString()
    }, {
      headers: {
        Authorization: 'Basic ' + new Buffer('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET).toString('base64'),
        'Content-Type': 'application/json',
      },
    })
  }
  var getSession = (sessionId) => {
    return axios.get(OPENVIDU_SERVER_URL + '/api/sessions/' + sessionId, {
      headers: {
        Authorization: 'Basic ' + new Buffer('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET).toString('base64'),
        'Content-Type': 'application/json',
      },
    })
  };

  var startRecording = () => {
    axios.post(OPENVIDU_SERVER_URL + '/api/recordings/start',
      {
        "session": "152",
        "name": "Video",
        "outputMode": "COMPOSED",
        "hasAudio": true,
        "hasVideo": true,
        "resolution": "1920x1080",
        "recordingLayout": "CUSTOM",
        "customLayout": "http://localhost:4000/joinclass?token=eyJjbGFzc0lkIjoiMTUyIiwiY2xhc3NOYW1lIjoiVG9waWMgODcxMjYzIiwiVHV0b3JOYW1lIjoiQWJoaXNoZWsgSmFpbiIsInVzZXJuYW1lIjoiYXNkIiwiZW1haWwiOiJzd2VldHlzajE4QGdtYWlsLmNvbSIsInR5cGUiOiJTIiwiaXNyZWNvcmRpbmciOnRydWV9"
      }
      , {
        headers: {
          Authorization: 'Basic ' + new Buffer('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET).toString('base64'),
          'Content-Type': 'application/json',
        },


      }).then((response) => {
        console.log("Recording");
        console.log(response);
      }).catch(response => {
        console.log("Recording");
        console.log(response);
      })

  };

  videoRouter.route('/createSession').post(function (req, res) {
    OV.createSession({ customSessionId: req.body.classId }).then(session => {
      console.log("Created sessionId:" + session.sessionId);
      var sql = "UPDATE shareskill.Class SET Session = '" + session.sessionId + "' where id=" + req.body.classId;
      Connection().query(sql);
      res.send(helper.formatSuccess(session.sessionId));
    }).catch(response => {
      res.send(helper.formatSuccess(response));
    })
  });

  videoRouter.route('/startrecording').post(function (req, res) {
    console.log("gahsdg");
    axios.post(OPENVIDU_SERVER_URL + '/api/recordings/start',
      {
        "session": 152,
        "name": "",
        "outputMode": "COMPOSED",
        "hasAudio": true,
        "hasVideo": true,
        "resolution": "1920x1080",
        "recordingLayout": "CUSTOM",
        "customLayout": "http://localhost:4000/joinclass?token=eyJjbGFzc0lkIjoiMTUyIiwiY2xhc3NOYW1lIjoiVG9waWMgODcxMjYzIiwiVHV0b3JOYW1lIjoiQWJoaXNoZWsgSmFpbiIsInVzZXJuYW1lIjoiYXNkIiwiZW1haWwiOiJzd2VldHlzajE4QGdtYWlsLmNvbSIsInR5cGUiOiJTIiwiaXNyZWNvcmRpbmciOnRydWV9"
      }
      , {
        headers: {
          Authorization: 'Basic ' + new Buffer('OPENVIDUAPP:' + OPENVIDU_SERVER_SECRET).toString('base64'),
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        res.send(helper.formatSuccess(response));
      }).catch(response => {
        res.send(helper.formatSuccess(response));
      })
  });

  // videoRouter.route('/generateToken').post(function (req, res) {
  //   var session;
  //   var tokens = [];
  //   var tokenPromises = [];
  //   var sql = "Select s.id , s.Name,  c.Session , c.Token, c.TutorName from Student s join Class c on s.ClassId = c.id where s.ClassId=" + req.body.classId + " and s.Token is Null";
  //   Connection().query(sql, function (err, result) {
  //     for (let i = 0; i < result.length; i++) {
  //       session = result[0].Session
  //       if (!session) {
  //         tokenPromises.push(generateToken(session, "SUBSCRIBER", result[i].id));
  //       }
  //       else {
  //         tokenPromises.push(generateToken(session, "SUBSCRIBER", result[i].id));
  //       }
  //     }

  //     if (result.length > 0 && !result[0].Token)
  //       tokenPromises.push(generateToken(session, "PUBLISHER", req.body.classId));

  //     Promise.all(tokenPromises).then((tokResult) => {
  //       console.log("Result received");
  //       for (var i = 0; i < tokResult.length; i++) {
  //         var tokData = tokResult[i].data;
  //         if (tokData.role == "SUBSCRIBER")
  //           var updateSql = "UPDATE Student SET Token = '" + tokData.token + "' where id = " + tokData.data;
  //         else
  //           var updateSql = "UPDATE Class SET Token = '" + tokData.token + "' where id = " + tokData.data;
  //         Connection().query(updateSql);
  //         tokens.push(tokResult[i].data.token);
  //       }
  //       res.send(helper.formatSuccess(tokens));
  //     });
  //   });
  // });
  generateTokenForSession = (req, res, isnew) => {
    if (req.body.type = "S") {
      var sql = "Select s.id from Student s where ClassId=" + req.body.classId + " and Email='" + req.body.email + "'";
      Connection().query(sql, function (err, result) {
        if (result.length > 0) {
          generateToken(req.body.classId, "PUBLISHER", result[0].id).then((tokResult) => {
            var tokData = tokResult.data;
            var updateSql = "UPDATE Student SET Token = '" + tokData.token + "' where id = " + tokData.data;
            Connection().query(updateSql);
            res.send(helper.formatSuccess(tokData.token));
          }).catch(err => {
            res.send(helper.formatFailure(err));
          });
        }
      });
    }
    else {
      generateToken(req.body.classId, "PUBLISHER", req.body.classId).then((tokResult) => {
        var tokData = tokResult.data;
        var updateSql = "UPDATE Class SET Token = '" + tokData.token + "' where id = " + tokData.data;
        Connection().query(updateSql);
        res.send(helper.formatSuccess(tokData.token));
      })
    }
    // if(isnew){
    //   setTimeout(() => {
    //     startRecording();
    //   }, 5000); 
    // }
  }
  videoRouter.route('/generateToken').post(function (req, res) {
    getSession(req.body.classId).then(sess => {
      generateTokenForSession(req, res);
    }).catch(err => {
      OV.createSession({ customSessionId: req.body.classId , recordingMode: "ALWAYS", defaultRecordingLayout: "CUSTOM",
      defaultCustomLayout:"http://classtree.in" }).then(sess => {
        generateTokenForSession(req, res,"new");
      });
    })
  });

  videoRouter.route('/joinClass').post(function (req, res) {
    var sql = "INSERT INTO Student (ClassId, Email, PhoneNo, Rating, Name,TimeZone) VALUES ?";
    var req = req.body;
    var values = [
      [req.classId, req.email, req.phoneNo, req.rating, req.name, req.timezone]
    ];

    try {

      Connection().query(sql, [values], function (err, result) {
        var studentId = result.insertId;
        if (err) throw err;
        var sql = "SELECT * from shareskill.Class where id = " + req.classId;
        Connection().query(sql, [], function (err, result) {
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
    catch (ex) {
      res.send(helper.formatFailure("Failed"));
    }
  });

  return videoRouter;
};

module.exports = routes;    
