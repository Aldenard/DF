var expect = require('expect.js'),
    helper = require('./support/helper'),
    verifyHelper = require('./support/verifyHelper');
var io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketURL = 'http://0.0.0.0:' + helper.port;

describe('Scenario 2 :', function () {

  before(function (done) {
    helper.startServer(done);
  });

  after(function () {
    helper.stopServer();
  });

  describe('leave after 2 joins', function () {

    var client1 = null;
    var client2 = null;

    beforeEach(function (done) {
      var connected = 0;
      var callback = function () {
        connected++;
        if (connected === 2) {
          done();
        }
      };

      client1 = io.connect(socketURL, options);
      client2 = io.connect(socketURL, options);
      client1.on('connect', callback);
      client2.on('connect', callback);
    });

    afterEach(function () {
      client1.disconnect();
      client2.disconnect();
    });

    it('should emit update event to remainings', function (done) {
      client1.emit('join', {name: 'foo', role: 'd'});
      client2.emit('join', {name: 'bar', role: 'd'});

      var afterLeave = false;
      client1.on('updated', function (data) {
        if (afterLeave) {
          verifyHelper.verifyParty(data.party, 0, 1, 0);
          verifyHelper.verifyParties(1);
          done();
        }
      });
      client2.on('updated', function () {
        client2.emit('leave');
        afterLeave = true;
      });
    });

  });

});
