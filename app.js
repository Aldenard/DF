//
// Modules
//
var app    = require('express')();
var server = module.exports = require('http').Server(app);
var io     = require('socket.io')(server);

//
// Variables
//
var config = require('./config.json');

//
// Routing
//
app.get('/', function (req, res) {
  res.send('Hello World!');
});

//
// Start Server
//
if (!module.parent) {
  server.listen(config.port);
  console.log('start listening port #' + config.port);
}

//
// Logic
//
var REQUIRE = {
  't': config.requirements.t,
  'd': config.requirements.d,
  'h': config.requirements.h
};

//
// party: {
//   t: [list of player],
//   d: [list of player],
//   h: [list of player]
// }
//
// player: {
//   name: "foo",
//   role: "t",
//   socket: <socket>,
// }
//
var parties = [];

var notifyUpdate = function (party) {
  var data = {
    party: {
      t: {current: party.t.length, require: REQUIRE.t},
      d: {current: party.d.length, require: REQUIRE.d},
      h: {current: party.h.length, require: REQUIRE.h}
    }
  };

  var i = 0;
  for (i = 0, l = party.t.length; i < l; i++) {
      party.t[i].socket.emit('updated', data);
  }
  for (i = 0, l = party.d.length; i < l; i++) {
      party.d[i].socket.emit('updated', data);
  }
  for (i = 0, l = party.h.length; i < l; i++) {
      party.h[i].socket.emit('updated', data);
  }
};

io.on('connection', function (socket) {
  socket.on('join', function (data) {
    if (data && data.name && data.role) {
      socket.emit('joined', {});

      // update or new party
      var player = {
        name: data.name,
        role: data.role,
        socket: socket,
        party: null
      };
      for (var i = 0, l = parties.length; i < l; i++) {
        var party = parties[i];
        if (party[player.role].length < REQUIRE[player.role]) {
          party[player.role].push(player);
          player.party = party;
          notifyUpdate(party);
        }
      }
      if (!player.party) {
        var newParty = {t: [], d: [], h: []};
        newParty[player.role].push(player);
        player.party = newParty;
        parties.push(newParty);
        notifyUpdate(newParty);
      }

      // disconnect
      socket.on('disconnect', function () {
        if (player.party) {
          var party = player.party;
          var index = party[player.role].indexOf(player);
          party[player.role].splice(index, 1);
          player.party = null;

          if (party.t.length === 0 && party.d.length === 0 && party.h.length === 0) {
            var pindex = parties.indexOf(party);
            parties.splice(pindex, 1);
          } else {
            notifyUpdate(party);
          }
        }
      });
    } else {
      socket.emit('joined', {error: 'missing'});
    }
  });
});
