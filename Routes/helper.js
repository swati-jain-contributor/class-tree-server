var formatSuccess = function (data) {
    return {
        status: "SUCCESS",
        response: data
    }
};
var formatFailure = function (data) {
    return {
        status: "FAILURE",
        response: null,
        errorCode: data,
        errorDesc: data
    }
};


module.exports= {
    formatFailure,
    formatSuccess
}