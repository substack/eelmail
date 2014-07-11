var net = require('net');
var forwards = {
    25: 9025,
    143: 9143
};

Object.keys(forwards).forEach(function (src) {
    var dst = forwards[src];
    var server = net.createServer(function (stream) {
        var c = net.connect(dst);
        c.on('error', function () {});
        stream.on('error', function () {});
        c.pipe(stream).pipe(c);
    });
    server.listen(src);
});
