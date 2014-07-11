var smtp = require('smtp-protocol');

module.exports = function () {
    smtp.createServer(function (req) {
        req.on('message', function (stream, ack) {
            console.log('from: ' + req.from);
            console.log('to: ' + req.to);
            
            //stream.pipe(save(req.from, req.to));
            ack.accept();
        });
    });
    servers.smtp.listen(9025);
};
