var net = require('net');

module.exports = function (eel, opts) {
    return net.createServer(function (stream) {
        // ...
    });
};
