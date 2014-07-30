var eelmail = require('../');
var level = require('level');
var bytewise = require('bytewise');

var db = level('./data.db');
var em = eelmail(db);

em.createServer('smtp').listen(9025);
em.createServer('pop').listen(9110);
em.createServer('imap').listen(9143);
