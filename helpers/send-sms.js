var msg91 = require("msg91")("168603AoFuzuWR59859f88", "LIVTOG", 4);
var sendSms = function (mobileNo, message) {
    msg91.send(mobileNo, message, function (err, response) {
        console.log(err);
        console.log(response);
        msg91.getBalance(4, function (err, msgCount) {
            console.log(err);
            console.log(msgCount);
        });
    });
};
module.exports = {
    sendSms
};