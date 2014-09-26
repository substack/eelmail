#!/usr/bin/env node

var eelmail = require('../');
var level = require('level-party');
var minimist = require('minimist');
var userCommand = require('accountdown-command');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var defined = require('defined');

var argv = minimist(process.argv.slice(2), {
    alias: { d: 'dir', h: 'help' },
    default: {
        dir: defined(
            process.env.EELMAIL_DATADIR,
            path.join(process.cwd(), 'eelmail.db')
        ),
        ports: { smtp: 25, imap: 143 }
    }
});

function createMail () {
    mkdirp.sync(argv.dir);
    var db = level(path.join(argv.dir, 'db'));
    return eelmail(db, { dir: path.join(argv.dir, 'blob') });
}

if (argv._[0] === 'users') {
    var em = createMail();
    var opts = { command: 'eelmail users' };
    var args = process.argv.slice(process.argv.indexOf('users') + 1);
    userCommand(em.users, args, opts, function (err) {
        if (err) {
            console.error(err + '');
            process.exit(1);
        }
        em.close();
    }).pipe(process.stdout);
}
else if (argv.help || argv._[0] === 'help') {
    showHelp(0, function () { db.close() });
}
else if (argv._[0] === 'server') {
    var em = createMail();
    var servers = {
        smtp: em.createServer('smtp'),
        imap: em.createServer('imap')
    };
    servers.smtp.listen(argv.ports.smtp);
    servers.imap.listen(argv.ports.imap);
}
else showHelp(1);

function showHelp (code) {
    var r = fs.createReadStream(path.join(__dirname, 'usage.txt'));
    r.once('end', function () {
        if (code) process.exit(code);
    });
    r.pipe(process.stdout);
}
