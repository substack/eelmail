var eelmail = require('../');
var level = require('level-party');

var db = level('./data/db');
var em = eelmail(db, { dir: './data' });

em.createServer('smtp').listen(25);
em.createServer('imap').listen(143);
