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
            if (!row) return this.push('* BAD Empty command line.\r\n');
            if (!row[0]) return this.push('* BAD No ID specified.\r\n');
            if (!row[1]) return this.push('* BAD No command specified.\r\n');
            
            console.log(row);
            
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
                var creds = { username: row[2], password: row[3] };
                eel.users.verify('basic', creds, function (err, ok, uid) {
                    if (err) {
                        stream.write(id + ' BAD Server error.\r\n')
                    }
                    else if (ok) {
                        stream.write(id + ' OK LOGIN completed\r\n');
                    }
                    else {
                        stream.write(id + ' NO LOGIN rejected\r\n');
                    }
                    next();
                });
            }
            else if (cmd === 'SELECT') {
                stream.write('* 1 EXISTS\r\n');
                stream.write('* 1 RECENT\r\n');
                stream.write(id + ' OK SELECT completed\r\n');
                next();
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
