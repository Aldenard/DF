var expect = require('expect.js');
var io = require('socket.io-client');

var options = {
  transports: ['websocket'],
  'force new connection': true
};

var socketURL = 'http://0.0.0.0:3000';

describe('DF Server', function () {

  it('should response when connected', function (done) {

    var client = io.connect(socketURL, options);
    client.on('connect', done);

  });

});
