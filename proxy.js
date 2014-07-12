var net = require('net');
var x256 = require('x256');
var through = require('through2');
var forwards = {
    25: 9025,
    143: 9143
};

Object.keys(forwards).forEach(function (src) {
    var dst = forwards[src];
    var server = net.createServer(function (stream) {
        console.error(Date.now() + ' begin');
        
        stream.on('end', function () {
            console.error(Date.now() + ' end');
        });
        
        var c = net.connect(dst);
        c.on('error', function (err) {
            console.error(err + '');
        });
        stream.on('error', function () {
            console.error(err + '');
        });
        
        stream.pipe(colorize([ 63, 255, 63 ])).pipe(process.stderr);
        c.pipe(colorize([ 63, 63, 255 ])).pipe(process.stderr);
        
        c.pipe(stream).pipe(c);
    });
    server.listen(src);
});

function colorize (rgb) {
    return through(function (buf, enc, next) {
        this.push(Buffer.concat([
            Buffer('\x1b[38;5;' + x256(rgb) + 'm'),
            buf,
            Buffer('\x1b[00m')
        ]));
        next();
    });
}
