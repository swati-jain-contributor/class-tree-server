var mongoose = require('mongoose'),
autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var sessionModel = new Schema({
    authCode: {
        type: String
    },
    authenticationStatus:{
        type:Boolean
    },
    memberid:{
        type:Number
    },
    userId: {type: String},
    name: {type: String},
    role: {type: String},
    status:{type: String},
    aptId:{type:String},
    createdAt:{type: Date,default: Date.now},
    updatedAt:{type: Date,default: Date.now},

});

sessionModel.plugin(autoIncrement.plugin,'Session' );
module.exports= mongoose.model('Session', sessionModel);