var app = require('../../app');
var port = 3001;
var running = false;

//
// Server Start/Stop
//
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

//
// Server Internal State
//
var getNumberOfParties = function () {
  console.log(app.parties);
  return app.parties.length;
};

//
// Export
//
exports.port = port;
exports.startServer = startServer;
exports.stopServer = stopServer;
exports.getNumberOfParties = getNumberOfParties;
