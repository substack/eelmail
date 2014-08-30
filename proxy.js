var net = require('net');
var colorize = require('ansi-color-stream');

var forwards = {
    25: 9025, // smtp
    143: 9143, // imap
    993: 9993 // imap ssl
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
        stream.on('error', function (err) {
            console.error(err + '');
        });
        
        stream.pipe(colorize('bright pink')).pipe(process.stderr);
        c.pipe(colorize('bright yellow')).pipe(process.stderr);
        
        c.pipe(stream).pipe(c);
    });
    server.listen(src);
});
