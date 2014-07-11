var through = require('through2');
var ImapParser = require('imap-parser');

module.exports = function () {
    var output = through();
    var parser = new ImapParser;
    parser.pipe(through.obj(function (row, enc, next) {
        console.error('row=', row);
        next();
    }));
    return duplexer(parser, output);
};
