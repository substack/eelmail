var smtp = require('smtp-protocol');

module.exports = function (eel, opts) {
    return smtp.createServer(opts, function (req) {
        req.on('message', function (stream, ack) {
            console.log('from: ' + req.from);
            console.log('to: ' + req.to);
            
            var save = eel.mailbox.save(req.from, req.to);
            save.on('error', function (err) { stream.destroy() });
            stream.pipe(save);
            ack.accept();
        });
    });
};
