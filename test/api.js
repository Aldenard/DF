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

  after(function() {
    helper.stopServer();
  });

  it('should response when connected', function (done) {

    var client = io.connect(socketURL, options);
    client.on('connect', function () {
      client.disconnect();
      done();
    });

  });

  describe('join message', function () {

    var client = null;

    beforeEach(function (done) {
      client = io.connect(socketURL, options);
      client.on('connect', done);
    });

    afterEach(function () {
      client.disconnect();
    });

    it('should returns error when argument is nothing', function (done) {

      client.emit('join');
      client.on('joined', function (response) {
        expect(response.error).to.be.ok();
        done();
      });

    });

    it('should returns error when argument is only name', function (done) {

      client.emit('join', {name: 'foo'});
      client.on('joined', function (response) {
        expect(response.error).to.be.ok();
        done();
      });

    });

    it('should returns without error when name and role are passed', function (done) {

      client.emit('join', {name: 'foo', role: 't'});
      client.on('joined', function (response) {
        expect(response.error).to.not.be.ok();
        done();
      });

    });

  });

});
