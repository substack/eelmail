var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var has = require('has');

var maildb = require('maildb');
var accountdown = require('accountdown');
var basic = require('accountdown-basic');

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
    this.users = opts.users || accountdown(db, { login: { basic: basic } });
    this.mailbox = opts.mailbox || maildb(db, opts);
    this.db = db;
}

Eel.prototype.createServer = function (name, opts) {
    if (!has(services, name)) return undefined;
    return services[name](this, opts);
};

Eel.prototype.close = function () {
    this.db.close();
};
