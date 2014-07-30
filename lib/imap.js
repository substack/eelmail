var through = require('through2');
var ImapParser = require('imap-parser');
var net = require('net');

var capabilities = [
    'IMAP4rev1',
    'STARTTLS',
    'AUTH=GSSAPI',
    'AUTH=PLAIN'
];

module.exports = function (eel, opts) {
    return net.createServer(function (stream) {
        var parser = new ImapParser;
        parser.pipe(through.obj(function (row, enc, next) {
console.error('row=', row);
            if (!row) return this.push('* BAD Empty command line.\r\n');
            if (!row[0]) return this.push('* BAD No ID specified.\r\n');
            if (!row[1]) return this.push('* BAD No command specified.\r\n');
            
            var id = row[0], cmd = row[1].toUpperCase();
            if (cmd === 'CAPABILITY') {
                stream.write(
                    'OK [CAPABILITY '
                    + capabilities.join(' ')
                    + '] localhost\r\n'
                );
                stream.write(id + ' OK CAPABILITY completed\r\n');
                next();
            }
            else if (cmd === 'LOGIN') {
                eel.account.test(row.slice(1), function (ok) {
                    
                });
            }
            else if (cmd === 'AUTHENTICATE') {
                
            }
            else {
                stream.write('* BAD command unknown or arguments invalid\r\n');
                next();
            }
        }));
        stream.pipe(parser);
        stream.write('* OK IMAP4rev1 server ready\r\n');
    });
};
