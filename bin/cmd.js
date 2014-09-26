#!/usr/bin/env node

var eelmail = require('../');
var level = require('level-party');
var minimist = require('minimist');
var userCommand = require('accountdown-command');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var argv = minimist(process.argv.slice(2), {
    alias: { d: 'dir', h: 'help' },
    default: {
        dir: path.join(process.cwd(), 'eelmail.db'),
        ports: { smtp: 25, imap: 143 }
    }
});
mkdirp.sync(argv.dir);

var db = level(path.join(argv.dir, 'db'));
var em = eelmail(db, { dir: argv.dir });

if (process.argv[2] === 'users') {
    var opts = { command: 'eelmail users' };
    userCommand(em.users, process.argv.slice(3), opts, function (err) {
        if (err) {
            console.error(err + '');
            process.exit(1);
        }
        db.close();
    }).pipe(process.stdout);
}
else if (argv.help) {
    showHelp(0);
}
else if (argv._[0] === 'server') {
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
    if (code) r.once('end', function () {
        process.exit(code);
    });
    r.pipe(process.stdout);
}
