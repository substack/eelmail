var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var has = require('has');

var accountdown = require('accountdown');
var basic = require('accountdown-basic');

var services = {
    smtp: require('./lib/smtp.js'),
    pop: require('./lib/pop.js'),
    imap: require('./lib/imap.js')
};

module.exports = Eel;
inherits(Eel, EventEmitter);

function Eel (opts) {
    if (!(this instanceof Eel)) return new Eel(opts);
    if (!opts) opts = {};
    this.users = opts.users;
}

Eel.prototype.createServer = function (name, opts) {
    if (!has(services, name)) return undefined;
    return services[name](this, opts);
};
