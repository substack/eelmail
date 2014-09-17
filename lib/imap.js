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
    var username = null;
    
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
            var user = row[2].split('@')[0];
            var creds = { username: user, password: row[3] };
            eel.users.verify('basic', creds, function (err, ok, uid) {
                if (err) {
                    self.push(id + ' BAD Server error.\r\n')
                }
                else if (ok) {
                    self.push(id + ' OK LOGIN completed\r\n');
                    username = user;
                }
                else {
                    self.push(id + ' NO LOGIN rejected\r\n');
                }
                next();
            });
        }
        else if (cmd === 'LOGOUT') {
            self.push('* BYE IMAP4rev1 Server logging out\r\n');
            self.push(id + ' OK LOGOUT completed\r\n');
            self.push(null);
            next();
        }
        else if (cmd === 'SELECT') {
            if (!auth()) return;
            
            eel.mailbox.info(username, function (err, info) {
                self.push('* ' + info.counts.exists + ' EXISTS\r\n');
                self.push('* ' + info.counts.recent + ' RECENT\r\n');
                self.push('* OK [UNSEEN ' + info.head.unseen
                    + '] Message ' + info.head.unseen + ' is first unseen\r\n'
                );
                self.push('* FLAGS (\\Answered \\Flagged '
                    + '\\Deleted \\Seen \\Draft)\r\n'
                );
                self.push('* OK [PERMANENTFLAGS '
                    + '(\\Deleted \\Seen \*)] Limited\r\n'
                );
                self.push(id + ' OK [READ-WRITE] SELECT completed\r\n');
                next();
            });
        }
        else if (cmd === 'EXPUNGE') {
            if (!auth()) return;
            
            eel.mailbox.expunge(function (err) {
                if (err) {
                    self.push(id + ' NO ' + errmsg(err) + '\r\n');
                }
                else self.push(id + ' OK EXPUNGE completed\r\n');
            });
            next();
        }
        else if (cmd === 'SEARCH') {
            if (!auth()) return;
            
            var label = row[2];
            eel.mailbox.search(username, row.slice(2), function (err, matches) {
                if (err) {
                    self.push(id + ' NO ' + errmsg(err) + '\r\n');
                }
                else {
                    var ids = matches.map(function (m) { return m.seq });
                    self.push('* SEARCH ' + ids.join(' ') + '\r\n');
                    self.push(id + ' OK SEARCH completed\r\n');
                }
                next();
            });
        }
        else if (cmd === 'FETCH') {
            if (!auth()) return;
            
            var stream = eel.mailbox.fetch(username, row[2], row[3]);
            stream.pipe(through.obj(
                function (r, enc, next) {
                    if (typeof r.value !== 'object') {
                        self.push('* ' + r.key + ' FETCH '
                            + r.value + '\r\n'
                        );
                        return next();
                    }
                    self.push('* ' + r.key + ' FETCH (' + row[3]
                        + ' {' + r.value.size + '}\r\n'
                    );
                    r.value.pipe(through(function (row_, enc_, next_) {
                        self.push(row_);
                        next_();
                    }, function () { self.push('\r\n)\r\n'); next() }));
                },
                function () {
                    self.push(id + ' OK FETCH completed\r\n');
                    next();
                }
            ));
        }
        else if (cmd === 'STORE') {
            if (!auth()) return;
            
            var seq = row[2];
            var type = row[3];
            var fields = row[4];
            eel.mailbox.store(seq, type, fields, function (err) {
                if (err) {
                    self.push(id + ' NO ' + err.replace(/\n/g, '') + '\r\n');
                }
                else self.push(id + ' OK STORE completed\r\n');
            });
            next();
        }
        else {
            self.push('* BAD command unknown or arguments invalid\r\n');
            next();
        }
        
        function auth () {
            if (username) return true;
            self.push(id + ' NO authenticate first\r\n');
            next();
            return false;
        }
    });
}

function errmsg (err) {
    if (typeof err === 'string') return err;
    if (err && err.message) return err.message;
    return String(err);
}
