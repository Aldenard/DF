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
  return app.parties.length;
};

//
//
//
var createCallbackHook = function(number, callback, context) {
  var _number = number;
  var _callback = callback || function () {};
  var _context = context || this;
  var called = 0;
  return function () {
    called++;
    if (called === _number) {
      _callback.apply(_context, arguments);
    }
  };
};

//
// Export
//
exports.port = port;
exports.startServer = startServer;
exports.stopServer = stopServer;
exports.getNumberOfParties = getNumberOfParties;
exports.createCallbackHook = createCallbackHook;
