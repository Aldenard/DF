//
// Modules
//
var app    = require('express')();
var server = module.exports = require('http').Server(app);
var io     = require('socket.io')(server);

//
// Variables
//
//var config = require('./config.json');

//
// Routing
//
app.get('/', function (req, res) {
  res.send('Hello World!');
});

io.on('connection', function (socket) {
  socket.on('join', function (data) {
    if (data && data.name && data.role) {
      socket.emit('joined', {});
      // create new party
    } else {
      socket.emit('joined', {error: 'missing'});
    }
  });
});

//
// Start Server
//
if (!module.parent) {
  server.listen(3000);
}
