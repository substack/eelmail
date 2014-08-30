#!/usr/bin/env node

var eelmail = require('../');
var level = require('level');
var db = level('data');
var em = eelmail(db);

em.users.create('mail@substack.net', {
    login: { basic: { username: 'mail@substack.net', password: 'beep boop' } },
    value: { bio: 'beep boop' }
});

em.createServer('smtp').listen(9025);
em.createServer('pop').listen(9110);
em.createServer('imap').listen(9143);
