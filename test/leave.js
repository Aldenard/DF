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
      var afterLeave = false;
      var called = 0;
      var joinUpdateCallback = function () {
        called++;
        if (called === 3) {
          afterLeave = true;
          client2.emit('leave');
        }
      };

      client1.emit('join', {name: 'foo', role: 'd'});
      client2.emit('join', {name: 'bar', role: 'd'});
      client1.on('updated', function (data) {
        if (afterLeave) {
          verifyHelper.verifyParty(data.party, 0, 1, 0);
          expect(helper.getNumberOfParties()).to.be(1);
          done();
        } else {
          joinUpdateCallback();
        }
      });
      client2.on('updated', joinUpdateCallback);
    });

  });

  describe('leave after mached', function () {

    var client1 = null;
    var client2 = null;
    var client3 = null;
    var client4 = null;

    beforeEach(function (done) {
      client1 = io.connect(socketURL, options);
      client2 = io.connect(socketURL, options);
      client3 = io.connect(socketURL, options);
      client4 = io.connect(socketURL, options);
      client1.on('connect', function () { client1.emit('join', {name: 'foo', role: 't'}); });
      client2.on('connect', function () { client2.emit('join', {name: 'bar', role: 'd'}); });
      client3.on('connect', function () { client3.emit('join', {name: 'fiz', role: 'd'}); });
      client4.on('connect', function () { client4.emit('join', {name: 'buz', role: 'h'}); });
      client1.on('matched', done);
    });

    afterEach(function () {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      client4.disconnect();
    });

    it('shoule be emit `canceled` event to all player', function (done) {
      var called = 0;
      var callback = function () {
        expect(helper.getNumberOfParties()).to.be(1);
        called++;
        if (called === 4) {
          done();
        }
      };

      client1.emit('accept');
      client2.emit('accept');
      client3.emit('accept');
      client4.emit('leave');
      client1.on('canceled', callback);
      client2.on('canceled', callback);
      client3.on('canceled', callback);
      client4.on('canceled', callback);
    });

    it('should remove only leaved player from the party', function (done) {
      var called = 0;
      var callback = function () {
        called++;
        if (called === 4) {
          done();
        }
      };

      client1.emit('accept');
      client2.emit('accept');
      client3.emit('accept');
      client4.emit('leave');
      client4.on('canceled', function () {
        client4.emit('join', {name: 'buz', role: 'h'});
      });
      client1.on('matched', callback);
      client2.on('matched', callback);
      client3.on('matched', callback);
      client4.on('matched', callback);
    });

  });

});
