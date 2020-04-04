var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var sessionModel = new Schema({
    title: {
        type: String
    },
    author: {type: String},
    genre: {type: String},
    read: {type: Boolean, default:false},
    status:{type: String},
    createdAT:{type: Date},
    updatedAt:{type: Date}
});

module.exports= mongoose.model('Session', sessionModel);