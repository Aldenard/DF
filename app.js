//
// Modules
//
var app    = require('express')();
var server = module.exports = require('http').createServer(app);
var io     = require('socket.io').listen(server);

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
  var port = process.env.PORT || config.port;
  server.listen(port);
  console.log('start listening port #' + port);
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

var notify = function (party, event, data) {
  var i = 0, l = 0;
  for (i = 0, l = party.t.length; i < l; i++) {
    party.t[i].socket.emit(event, data);
  }
  for (i = 0, l = party.d.length; i < l; i++) {
    party.d[i].socket.emit(event, data);
  }
  for (i = 0, l = party.h.length; i < l; i++) {
    party.h[i].socket.emit(event, data);
  }
};

var notifyUpdate = function (party) {
  var i = 0, l = 0, acceptT = 0, acceptD = 0, acceptH = 0;
  for (i = 0, l = party.t.length; i < l; i++) {
    acceptT += party.t[i].accepted ? 1 : 0;
  }
  for (i = 0, l = party.d.length; i < l; i++) {
    acceptD += party.d[i].accepted ? 1 : 0;
  }
  for (i = 0, l = party.h.length; i < l; i++) {
    acceptH += party.h[i].accepted ? 1 : 0;
  }
  var data = {
    party: {
      t: {current: party.t.length, accept: acceptT, require: REQUIRE.t},
      d: {current: party.d.length, accept: acceptD, require: REQUIRE.d},
      h: {current: party.h.length, accept: acceptH, require: REQUIRE.h}
    }
  };
  notify(party, 'updated', data);

  if (acceptT === REQUIRE.t &&
      acceptD === REQUIRE.d &&
      acceptH === REQUIRE.h) {
      var players = [];
      for (i = 0, l = party.t.length; i < l; i++) {
        players.push(party.t[i].name);
      }
      for (i = 0, l = party.d.length; i < l; i++) {
        players.push(party.d[i].name);
      }
      for (i = 0, l = party.h.length; i < l; i++) {
        players.push(party.h[i].name);
      }
      notify(party, 'accepted', {players: players});
  }
};

io.on('connection', function (socket) {
  var player = {
    name: null,
    role: null,
    accepted: false,
    socket: socket,
    party: null
  };

  socket.on('join', function (data) {
    if (data && data.name && data.role) {
      socket.emit('joined', {});

      // Update player info
      player.name = data.name;
      player.role = data.role;

      // update or new party
      for (var i = 0, l = parties.length; i < l; i++) {
        var party = parties[i];
        if (party[player.role].length < REQUIRE[player.role]) {
          party[player.role].push(player);
          player.party = party;
          notifyUpdate(party);
          break;
        }
      }
      if (!player.party) {
        var newParty = {t: [], d: [], h: [], matched: false};
        newParty[player.role].push(player);
        player.party = newParty;
        parties.push(newParty);
        notifyUpdate(newParty);
      }

      // party is mached or not
      if (player.party.t.length === REQUIRE.t &&
          player.party.d.length === REQUIRE.d &&
          player.party.h.length === REQUIRE.h) {
          player.party.matched = true;
          notify(player.party, 'matched');
      }
    } else {
      socket.emit('joined', {error: 'missing'});
    }
  });

  socket.on('accept', function () {
    if (player.party.matched && !player.accepted) {
      player.accepted = true;
      notifyUpdate(player.party);
    }
  });

  // disconnect / leave
  var leave = function () {
    if (player.party) {
      // canceled
      if (player.party.matched) {
        notify(player.party, 'canceled');
      }

      // remove player from party
      var party = player.party;
      var index = party[player.role].indexOf(player);
      party[player.role].splice(index, 1);
      party.matched = false;

      // reset player
      player.name = null;
      player.role = null;
      player.accepted = false;
      player.party = null;

      // check empty party
      if (party.t.length === 0 && party.d.length === 0 && party.h.length === 0) {
        var pindex = parties.indexOf(party);
        parties.splice(pindex, 1);
      } else {
        notifyUpdate(party);
      }
    }
  };
  socket.on('disconnect', leave);
  socket.on('leave', leave);
});

if (app.settings.env === 'test') {
    module.exports.parties = parties;
}
