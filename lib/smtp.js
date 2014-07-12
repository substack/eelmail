var smtp = require('smtp-protocol');

module.exports = function (eel, opts) {
    return smtp.createServer(function (req) {
        req.on('message', function (stream, ack) {
            console.log('from: ' + req.from);
            console.log('to: ' + req.to);
            
            //stream.pipe(save(req.from, req.to));
            ack.accept();
        });
    });
};
