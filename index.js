var net = require('net');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var bytewise = require('bytewise');

var services = {
    smtp: require('./lib/smtp.js'),
    pop: require('./lib/pop.js'),
    imap: require('./lib/imap.js')
};

module.exports = Eel;
inherits(Eel, EventEmitter);

function Eel (db, opts) {
    if (!(this instanceof Eel)) return new Eel(db, opts);
    if (!opts) opts = {};
    this.db = db;
}

Eel.prototype.createServer = function (name, opts) {
    if (!has(services, name)) return undefined;
    return services[name](this, opts);
};

Eel.prototype.login = function (creds, cb) {
    var key = [ 'user', ];
    this.db.get(key, { keyEncoding: bytewise }, function (err, row) {
    });
};

function has (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
