var smtp = require('smtp-protocol');
var fs = require('fs');
var path = require('path');

var server = smtp.createServer(function (req) {
    req.on('message', function (stream, ack) {
        console.log('from: ' + req.from);
        console.log('to: ' + req.to);
        
        stream.pipe(save(req.from, req.to));
        ack.accept();
    });
});
server.listen(9025);

function save (from, to) {
    var n = Math.floor(Math.pow(16, 8) * Math.random());
    var file = path.join('data', Date.now() + n + '-'
        + esc(from) + '-' + esc(to))
    ;
    return fs.createWriteStream(file);
}

function esc (str) {
    return String(str).replace(/\W+/g, '_');
}
