#!/usr/bin/env node

var eelmail = require('../');
var level = require('level');
var db = level('/tmp/mail/db');
var em = eelmail(db, { dir: '/tmp/mail/blob' });

em.users.create('substack@localhost', {
    login: { basic: { username: 'substack', password: 'beep boop' } },
    value: { bio: 'beep boop' }
});

em.createServer('smtp').listen(9025);
em.createServer('pop').listen(9110);
em.createServer('imap').listen(9143);
