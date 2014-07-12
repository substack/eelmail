var through = require('through2');
var ImapParser = require('imap-parser');
var net = require('net');

module.exports = function (eel, opts) {
    return net.createServer(function (stream) {
stream.on('data', console.log); 
        var parser = new ImapParser;
        parser.pipe(through.obj(function (row, enc, next) {
            console.error('row=', row);
            next();
        }));
        stream.pipe(parser);
    });
};
