#!/usr/bin/env node

var eelmail = require('../');
var level = require('level-party');
var minimist = require('minimist');
var userCommand = require('accountdown-command');
var path = require('path');
var mkdirp = require('mkdirp');

var argv = minimist(process.argv.slice(2), {
    alias: { d: 'dir' },
    default: {
        dir: path.join(process.cwd(), 'eelmail.db'),
        ports: { smtp: 25, imap: 143 }
    }
});
mkdirp.sync(argv.dir);

var db = level(path.join(argv.dir, 'db'));
var em = eelmail(db, { dir: argv.dir });

if (process.argv[2] === 'users') {
    userCommand(db, process.argv.slice(3), {
        command: 'eelmail users'
    });
}
else {
    var servers = {
        smtp: em.createServer('smtp'),
        imap: em.createServer('imap')
    };
    servers.smtp.listen(argv.ports.smtp);
    servers.imap.listen(argv.ports.imap);
}
