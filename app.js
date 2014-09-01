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
  socket.emit('news', {hello: 'world'});
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

//
// Start Server
//
if (!module.parent) {
  server.listen(3000);
}
