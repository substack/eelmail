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
        stream.pipe(parser)
            .pipe(createStream(eel))
            .pipe(stream)
        ;
        stream.write('* OK IMAP4rev1 server ready\r\n');
    });
};

function createStream (eel) {
    return through.obj(function (row, enc, next) {
        var self = this;
        
        if (!row) return this.push('* BAD Empty command line.\r\n');
        if (!row[0]) return this.push('* BAD No ID specified.\r\n');
        if (!row[1]) return this.push('* BAD No command specified.\r\n');
        
        console.log(row);
        
        var id = row[0], cmd = row[1].toUpperCase();
        if (cmd === 'CAPABILITY') {
            this.push(
                'OK [CAPABILITY '
                + capabilities.join(' ')
                + '] localhost\r\n'
            );
            this.push(id + ' OK CAPABILITY completed\r\n');
            next();
        }
        else if (cmd === 'LOGIN') {
            var creds = { username: row[2], password: row[3] };
            eel.users.verify('basic', creds, function (err, ok, uid) {
                if (err) {
                    self.push(id + ' BAD Server error.\r\n')
                }
                else if (ok) {
                    self.push(id + ' OK LOGIN completed\r\n');
                }
                else {
                    self.push(id + ' NO LOGIN rejected\r\n');
                }
                next();
            });
        }
        else if (cmd === 'SELECT') {
            self.push('* 1 EXISTS\r\n');
            self.push('* 1 RECENT\r\n');
            self.push(id + ' OK SELECT completed\r\n');
            next();
        }
        else if (cmd === 'EXPUNGE') {
            self.push(id + ' OK EXPUNGE completed\r\n');
            next();
        }
        else {
            self.push('* BAD command unknown or arguments invalid\r\n');
            next();
        }
    });
}
