var app = require('../../app');
var port = 3001;
var running = false;

var startServer = function (callback) {
  if (!running) {
    app.listen(port, function () {
      running = true;
      callback();
    });
  }
};

var stopServer = function () {
  if (running) {
    app.close();
    running = false;
  }
};

process.on('exit', function () {
 stopServer();
});

exports.port = port;
exports.startServer = startServer;
exports.stopServer = stopServer;
