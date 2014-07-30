var net = require('net');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var accountdown = require('accountdown');
var basic = require('accountdown-basic');

var services = {
    smtp: require('./lib/smtp.js'),
    pop: require('./lib/pop.js'),
    imap: require('./lib/imap.js')
};

module.exports = Eel;
inherits(Eel, EventEmitter);

function Eel (db) {
    if (!(this instanceof Eel)) return new Eel(db);
    this.db = db;
    this.users = accountdown(db, { login: { basic: basic } });
}

Eel.prototype.createServer = function (name, opts) {
    if (!has(services, name)) return undefined;
    return services[name](this, opts);
};

function has (obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
