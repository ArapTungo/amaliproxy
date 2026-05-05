module.exports = {
    log: function (msg) {
        console.log(new Date().toISOString() + " | " + msg);
    },
    error: function (err) {
        console.error(new Date().toISOString() + " | ERROR | " + err);
    }
};