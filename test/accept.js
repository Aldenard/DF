var expect = require('expect.js'),
    helper = require('./support/helper'),
    verifyHelper = require('./support/verifyHelper');
var io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketURL = 'http://0.0.0.0:' + helper.port;

describe('Scenario 3 :', function () {

  before(function (done) {
    helper.startServer(done);
  });

  after(function () {
    helper.stopServer();
  });

  describe('4 joins', function () {

    var client1 = null;
    var client2 = null;
    var client3 = null;
    var client4 = null;

    beforeEach(function (done) {
      var callback = helper.createCallbackHook(4, function () { done(); });
      client1 = io.connect(socketURL, options);
      client2 = io.connect(socketURL, options);
      client3 = io.connect(socketURL, options);
      client4 = io.connect(socketURL, options);
      client1.on('connect', callback);
      client2.on('connect', callback);
      client3.on('connect', callback);
      client4.on('connect', callback);
    });

    afterEach(function () {
      client1.disconnect();
      client2.disconnect();
      client3.disconnect();
      client4.disconnect();
    });

    it('should emit `matched` event when they have suitable role for requirement', function (done) {
      var callback = helper.createCallbackHook(4, function () { done(); });
      client1.emit('join', {name: 'foo', role: 't'});
      client2.emit('join', {name: 'bar', role: 'd'});
      client3.emit('join', {name: 'fiz', role: 'd'});
      client4.emit('join', {name: 'buz', role: 'h'});
      client1.on('matched', callback);
      client2.on('matched', callback);
      client3.on('matched', callback);
      client4.on('matched', callback);
    });

    describe('and 4 accept', function () {

      beforeEach(function (done) {
        var callback = helper.createCallbackHook(4, function () { done(); });
        client1.emit('join', {name: 'foo', role: 't'});
        client2.emit('join', {name: 'bar', role: 'd'});
        client3.emit('join', {name: 'fiz', role: 'd'});
        client4.emit('join', {name: 'buz', role: 'h'});
        client1.on('matched', callback);
        client2.on('matched', callback);
        client3.on('matched', callback);
        client4.on('matched', callback);
      });

      afterEach(function () {
        client1.removeAllListeners('updated');
        client2.removeAllListeners('updated');
        client3.removeAllListeners('updated');
        client4.removeAllListeners('updated');
        client1.removeAllListeners('accepted');
        client2.removeAllListeners('accepted');
        client3.removeAllListeners('accepted');
        client4.removeAllListeners('accepted');
        client1.emit('leave');
        client2.emit('leave');
        client3.emit('leave');
        client4.emit('leave');
      });

      it('should emit `updated` event', function (done) {
        var callback = helper.createCallbackHook(4 * 4, function () { done(); });
        client1.emit('accept');
        client2.emit('accept');
        client3.emit('accept');
        client4.emit('accept');
        client1.on('updated', callback);
        client2.on('updated', callback);
        client3.on('updated', callback);
        client4.on('updated', callback);
      });

      it('should emit `accepted` event', function (done) {
        var called = 0;
        var callback = function (data) {
          expect(data.players).to.be.an('array');
          expect(data.players.length).to.eql(4);
          expect(data.players).to.contain('foo');
          expect(data.players).to.contain('bar');
          expect(data.players).to.contain('fiz');
          expect(data.players).to.contain('buz');

          called++;
          if (called === 4) {
            done();
          }
        };

        client1.emit('accept');
        client2.emit('accept');
        client3.emit('accept');
        client4.emit('accept');
        client1.on('accepted', callback);
        client2.on('accepted', callback);
        client3.on('accepted', callback);
        client4.on('accepted', callback);
      });

    });

  });

  // describe('accept before matched');

});
