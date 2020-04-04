var uuid = require('node-uuid');
var sessionController = function(Session){

    var createNewSession=function(){
        var session =new Session();
        session.authCode=uuid.v1();
        session.userId=null;
        session.role=null;
        session.status='active';
        session.memberid=null;
        session.save();
        return session;
    }

    return {
        
        createNewSession
    }
}

module.exports = sessionController;