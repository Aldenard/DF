var app = require('../../app');
var port = 3001;

var startServer = function (callback) {
  app.listen(port, function () {
    callback();
  });
};

var stopServer = function () {
  app.close();
};

process.on('exit', function () {
 stopServer();
});

exports.port = port;
exports.startServer = startServer;
exports.stopServer = stopServer;
