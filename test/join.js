var expect = require('expect.js'),
    helper = require('./support/helper'),
    verifyHelper = require('./support/verifyHelper');

var io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketURL = 'http://0.0.0.0:' + helper.port;

describe('Scenario 1 :', function () {

  before(function (done) {
    helper.startServer(done);
  });

  after(function () {
    helper.stopServer();
  });

  describe('single join', function () {

    var client = null;

    beforeEach(function (done) {
      client = io.connect(socketURL, options);
      client.on('connect', done);
    });

    afterEach(function () {
      client.disconnect();
    });

    it('should create single party', function (done) {
      client.emit('join', {name: 'foo', role: 't'});
      client.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 1, 0, 0);
        verifyHelper.verifyParties(1);
        done();
      });
    });

  });

  describe('2 joins', function () {

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

    it('should create multiple party when they are `t` and `t`', function (done) {
      client1.emit('join', {name: 'foo', role: 't'});
      client2.emit('join', {name: 'bar', role: 't'});

      client1.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 1, 0, 0);
        verifyHelper.verifyParties(1);
      });
      client2.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 1, 0, 0);
        verifyHelper.verifyParties(2);
        done();
      });
    });

    it('should create multiple party when they are `h` and `h`', function (done) {
      client1.emit('join', {name: 'foo', role: 'h'});
      client2.emit('join', {name: 'bar', role: 'h'});

      client1.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 0, 0, 1);
        verifyHelper.verifyParties(1);
      });
      client2.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 0, 0, 1);
        verifyHelper.verifyParties(2);
        done();
      });
    });

    it('should create single party when they are `d` and `d`', function (done) {
      client1.emit('join', {name: 'foo', role: 'd'});
      client2.emit('join', {name: 'bar', role: 'd'});

      var fistTime = true;
      client1.on('updated', function (data) {
        if (firstTime) {
          verifyHelper.verifyParty(data.party, 0, 1, 0);
          verifyHelper.verifyParties(1);
          firstTime = false;
        } else {
          verifyHelper.verifyParty(data.party, 0, 2, 0);
          verifyHelper.verifyParties(1);
        }
      });
      client2.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 0, 2, 0);
        verifyHelper.verifyParties(1);
        done();
      });
    });

    it('should create single party when they are `t` and `d`', function (done) {
      client1.emit('join', {name: 'foo', role: 't'});
      client2.emit('join', {name: 'bar', role: 'd'});

      var firstTime = true;
      client1.on('updated', function (data) {
        if (firstTime) {
          verifyHelper.verifyParty(data.party, 1, 0, 0);
          verifyHelper.verifyParties(1);
        } else {
          verifyHelper.verifyParty(data.party, 1, 1, 0);
          verifyHelper.verifyParties(1);
        }
      });
      client2.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 1, 1, 0);
        verifyHelper.verifyParties(1);
        done();
      });
    });
  });

  describe('4 joins', function () {

    var client1 = null;
    var client2 = null;
    var client3 = null;
    var client4 = null;

    beforeEach(function (done) {
      var connected = 0;
      var callback = function () {
        connected++;
        if (connected === 4) {
          done();
        }
      };

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

    it('should create single party when they are `t` and `d` nad `d` and `h`', function (done) {
      client1.emit('join', {name: 'foo', role: 't'});
      client2.emit('join', {name: 'bar', role: 'd'});
      client3.emit('join', {name: 'fiz', role: 'd'});
      client4.emit('join', {name: 'buz', role: 'h'});
      client4.on('updated', function (data) {
        verifyHelper.verifyParty(data.party, 1, 2, 1);
        verifyHelper.verifyParties(1);
        done();
      });
    });

  });

});
