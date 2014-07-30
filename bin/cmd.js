#!/usr/bin/env node

var eelmail = require('../');
var level = require('level');
var bytewise = require('bytewise');
var shasum = require('shasum');

var db = level('data', {
    keyEncoding: require('bytewise'),
    valueEncoding: 'utf8'
});

var em = eelmail({
    testAccount: function (type, creds, cb) {
        if (type === 'login') {
            db.get([ 'account', creds[0] ], function (err, row) {
                if (err) cb(null, false)
                else cb(row && row.hash && hash(row.salt, creds[1]))
            });
        }
        else cb(null, false);
    },
    addAccount: function (type, creds, cb) {
        if (type === 'login') {
        }
    }
});

function hash (salt, s) { return shasum(salt + s) }

em.createServer('smtp').listen(9025);
em.createServer('pop').listen(9110);
em.createServer('imap').listen(9143);
