var Duplex = require('readable-stream').Duplex;
var inherits = require('inherits');

module.exports = Pop;
inherits(Pop, Duplex);

function Pop (eel) {
    if (!(this instanceof Pop)) return new Pop(eel);
    this.eel = eel;
}

Pop.prototype._read = function () {
};

Pop.prototype._write = function (buf, enc, next) {
    console.log('buf=', buf);
    // ...
    next();
};
