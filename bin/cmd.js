#!/usr/bin/env node

var fs = require('fs');
var eelmail = require('../');
var em = eelmail();

em.createServer('smtp').listen(9025);
em.createServer('pop3').listen(9110);
em.createServer('imap').listen(9143);
