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
        expect(helper.getNumberOfParties()).to.be(1);
        done();
      });
    });

  });

  describe('2 joins', function () {

    var client1 = null;
    var client2 = null;

    beforeEach(function (done) {
      var callback = helper.createCallbackHook(2, function () { done(); });
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
      var objParty1 = null, objParty2 = null;
      var numParty1 = null, numParty2 = null;
      var verify = function () {
        verifyHelper.verifyParty(objParty1, 1, 0, 0);
        verifyHelper.verifyParty(objParty2, 1, 0, 0);
        expect(numParty1).to.be(1);
        expect(numParty2).to.be(2);
        done();
      };

      // join first t
      client1.emit('join', {name: 'foo', role: 't'});

      var called = 0;
      client1.on('updated', function (data) {
        called++;
        objParty1 = data.party;
        numParty1 = helper.getNumberOfParties();

        // join second t
        client2.emit('join', {name: 'bar', role: 't'});
      });
      client2.on('updated', function (data) {
        called++;
        objParty2 = data.party;
        numParty2 = helper.getNumberOfParties();
        if (called == 2) {
          verify();
        }
      });
    });

    it('should create multiple party when they are `h` and `h`', function (done) {
      var objParty1 = null, objParty2 = null;
      var numParty1 = null, numParty2 = null;
      var verify = function () {
        verifyHelper.verifyParty(objParty1, 0, 0, 1);
        verifyHelper.verifyParty(objParty2, 0, 0, 1);
        expect(numParty1).to.be(1);
        expect(numParty2).to.be(2);
        done();
      };

      // join first h
      client1.emit('join', {name: 'foo', role: 'h'});

      var called = 0;
      client1.on('updated', function (data) {
        called++;
        objParty1 = data.party;
        numParty1 = helper.getNumberOfParties();

        // join second h
        client2.emit('join', {name: 'bar', role: 'h'});
      });
      client2.on('updated', function (data) {
        called++;
        objParty2 = data.party;
        numParty2 = helper.getNumberOfParties();
        if (called === 2) {
          verify();
        }
      });
    });

    it('should create single party when they are `d` and `d`', function (done) {
      var objParty1 = null, objParty2 = null, objParty3 = null;
      var numParty1 = null, numParty2 = null, numParty3 = null;
      var verify = function () {
        verifyHelper.verifyParty(objParty1, 0, 1, 0);
        verifyHelper.verifyParty(objParty2, 0, 2, 0);
        verifyHelper.verifyParty(objParty3, 0, 2, 0);
        expect(numParty1).to.be(1);
        expect(numParty2).to.be(1);
        expect(numParty3).to.be(1);
        done();
      };

      // join first d
      client1.emit('join', {name: 'foo', role: 'd'});

      var called = 0;
      client1.on('updated', function (data) {
        called++;
        if (called === 1) {
          objParty1 = data.party;
          numParty1 = helper.getNumberOfParties();

          // join second d
          client2.emit('join', {name: 'bar', role: 'd'});
        } else {
          objParty2 = data.party;
          numParty2 = helper.getNumberOfParties();
        }
        if (called === 3) {
          verify();
        }
      });
      client2.on('updated', function (data) {
        called++;
        objParty3 = data.party;
        numParty3 = helper.getNumberOfParties();
        if (called === 3) {
          verify();
        }
      });
    });

    it('should create single party when they are `t` and `d`', function (done) {
      var objParty1 = null, objParty2 = null, objParty3 = null;
      var numParty1 = null, numParty2 = null, numParty3 = null;
      var verify = function () {
        verifyHelper.verifyParty(objParty1, 1, 0, 0);
        verifyHelper.verifyParty(objParty2, 1, 1, 0);
        verifyHelper.verifyParty(objParty3, 1, 1, 0);
        expect(numParty1).to.be(1);
        expect(numParty2).to.be(1);
        expect(numParty3).to.be(1);
        done();
      };

      // join t
      client1.emit('join', {name: 'foo', role: 't'});

      var called = 0;
      client1.on('updated', function (data) {
        called++;
        if (called === 1) {
          objParty1 = data.party;
          numParty1 = helper.getNumberOfParties();

          // join d
          client2.emit('join', {name: 'bar', role: 'd'});
        } else {
          objParty2 = data.party;
          numParty2 = helper.getNumberOfParties();
        }
        if (called === 3) {
          verify();
        }
      });
      client2.on('updated', function (data) {
        called++;
        objParty3 = data.party;
        numParty3 = helper.getNumberOfParties();
        if (called === 3) {
          verify();
        }
      });
    });
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

    it('should create single party when they are `t`, `d`, `d` and `h`', function (done) {
      var callback = helper.createCallbackHook(10, function (data) {
        verifyHelper.verifyParty(data.party, 1, 2, 1);
        expect(helper.getNumberOfParties()).to.be(1);
        done();
      });
      client1.emit('join', {name: 'foo', role: 't'});
      client2.emit('join', {name: 'bar', role: 'd'});
      client3.emit('join', {name: 'fiz', role: 'd'});
      client4.emit('join', {name: 'buz', role: 'h'});
      client1.on('updated', callback);
      client2.on('updated', callback);
      client3.on('updated', callback);
      client4.on('updated', callback);
    });

  });

});
