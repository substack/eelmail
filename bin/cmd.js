#!/usr/bin/env node

var eelmail = require('../');
var accountdown = require('accountdown');
var level = require('level');
var db = level('data');

var em = eelmail({
    users: accountdown(db, {
        login: { basic: require('accountdown-basic') }
    })
});

em.users.create('substack', {
    login: { basic: { username: 'substack', password: 'beep boop' } },
    value: { bio: 'beep boop' }
});

em.createServer('smtp').listen(9025);
em.createServer('pop').listen(9110);
em.createServer('imap').listen(9143);
