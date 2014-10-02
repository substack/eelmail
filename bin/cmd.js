#!/usr/bin/env node

var eelmail = require('../');
var level = require('level-party');
var minimist = require('minimist');
var userCommand = require('accountdown-command');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var defined = require('defined');
var alloc = require('tcp-bind');

var argv = minimist(process.argv.slice(2), {
    alias: { d: 'dir', h: 'help', u: 'uid', g: 'gid' },
    default: {
        dir: defined(
            process.env.EELMAIL_DATADIR,
            path.join(process.cwd(), 'eelmail.db')
        ),
        ports: { smtp: 25, imap: 143, imaps: 993 }
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
    var portfd = {};
    var defaults = { smtp: 25, imap: 143, imaps: 993 };
    [ 'smtp', 'imap', 'imaps' ].forEach(function (key) {
        if (argv.ports[key] !== 0 && argv.ports[key] !== false) {
            portfd[key] = alloc(argv.ports[key] || defaults[key]);
        }
    });
    if (argv.gid) process.setgid(argv.gid);
    if (argv.uid) process.setuid(argv.uid);
    
    var em = createMail();
    var servers = {};
    
    if (argv.ports.smtp !== 0 && argv.ports.smtp !== false) {
        servers.smtp = em.createServer('smtp', argv.smtp);
        servers.smtp.listen({ fd: portfd.smtp });
    }
    if (argv.ports.imap !== 0 && argv.ports.imap !== false) {
        servers.imap = em.createServer('imap');
        servers.imap.listen({ fd: portfd.imap });
    }
    if (argv.imap) {
        var imapArgs = {};
        if (argv.imap.key) imapArgs.key = fs.readFileSync(argv.imap.key);
        if (argv.imap.cert) imapArgs.cert = fs.readFileSync(argv.imap.cert);
        if (argv.imap.pfx) imapArgs.pfx = fs.readFileSync(argv.imap.pfx);
        servers.imaps = em.createServer('imap', imapArgs);
        servers.imaps.listen({ fd: portfd.imaps });
    }
}
else showHelp(1);

function showHelp (code) {
    var r = fs.createReadStream(path.join(__dirname, 'usage.txt'));
    r.once('end', function () {
        if (code) process.exit(code);
    });
    r.pipe(process.stdout);
}
