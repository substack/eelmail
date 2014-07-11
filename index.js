var net = require('net');
var EventEmitter = require('events').EventEmitter;

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

Eel.prototype.createStream = function (name) {
    if (!has(services, name)) return undefined;
    return services[name](self);
};

Eel.prototype.createServer = function (name) {
    if (!has(services, name)) return undefined;
    var self = this;
    return net.createServer(function (stream) {
        stream.pipe(self.createStream(name)).pipe(stream);
    });
};
