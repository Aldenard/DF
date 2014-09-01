var expect = require('expect.js'),
    helper = require('./support/helper');
var io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketURL = 'http://0.0.0.0:' + helper.port;

describe('DF Server', function () {

  before(function (done) {
    helper.startServer(done);
  });

  it('should response when connected', function (done) {

    var client = io.connect(socketURL, options);
    client.on('connect', done);

  });

});
