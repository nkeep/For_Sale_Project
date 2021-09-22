const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/forsale-server",
});
let players = {}; //Stores key value pairs of rooms and players
let gameEnd = {};

io.on("connection", function (socket) {
  self = this;
  this.roomId;
  console.log("A user connected: " + socket.id);

  socket.on("createRoom", function (roomId, name) {
    console.log([...io.sockets.adapter.rooms.keys()]);
    socket.join(roomId);
    self.roomId = roomId;
    players[roomId] = [];
    players[roomId].push({
      playerId: socket.id,
      playerName: name,
      isIn: true,
      playedHouse: false,
      ready: false,
    });
    gameEnd[self.roomId] = [{ gameEnd: false }];
    io.to(roomId).emit("isPlayerA");
    io.to(roomId).emit("playerJoined", [name], self.roomId);
  });
  socket.on("joinRoom", function (roomId, name) {
    console.log([...io.sockets.adapter.rooms.keys()]);
    let roomFound = false;
    [...io.sockets.adapter.rooms.keys()].forEach((room) => {
      console.log("room: " + room);
      try {
        if (room === roomId) {
          socket.join(roomId);
          self.roomId = roomId;
          roomFound = true;
          players[roomId].push({
            playerId: socket.id,
            playerName: name,
            isIn: true,
            playedHouse: false,
            ready: false,
          });
          console.log("entered room" + roomId);
          let roomPlayers = [];
          players[roomId].forEach((player) =>
            roomPlayers.push(player["playerName"])
          );
          io.to(roomId).emit("playerJoined", roomPlayers, self.roomId);
        }
      } catch {}
    });
    if (!roomFound) {
      console.log("room doesn't exist");
    }
  });
  socket.on("loadGame", function () {
    let roomPlayers = [];
    players[self.roomId].forEach((player) =>
      roomPlayers.push(player["playerName"])
    );
    io.to(self.roomId).emit("loadGame", roomPlayers);
  });

  socket.on("gameStart", function (houseCards, moneyCards) {
    io.to(self.roomId).emit("startGame", houseCards, moneyCards);
  });

  socket.on("raise", function (previousPlayer, bidNumber) {
    //Determines next player
    console.log("raise called");
    let nextPlayer = 0;
    for (
      let i = previousPlayer;
      i < players[self.roomId].length + previousPlayer;
      i++
    ) {
      //Circular array accessing https://stackoverflow.com/questions/17483149/how-to-access-array-in-circular-manner-in-javascript
      if (
        players[self.roomId][
          ((i % players[self.roomId].length) + players[self.roomId].length) %
            players[self.roomId].length
        ].isIn
      ) {
        console.log(
          "next player is: " +
            (((i % players[self.roomId].length) + players[self.roomId].length) %
              players[self.roomId].length)
        );
        nextPlayer =
          ((i % players[self.roomId].length) + players[self.roomId].length) %
          players[self.roomId].length;
        io.to(self.roomId).emit(
          "nextTurn",
          previousPlayer,
          0,
          nextPlayer + 1,
          bidNumber
        );
        break;
      }
    }
  });

  socket.on("pass", function (previousPlayer, bidNumber) {
    players[self.roomId][previousPlayer - 1].isIn = false;
    let numPlayersIn = 0;
    let winningPlayer;
    players[self.roomId].forEach((player, index) => {
      if (player.isIn) {
        numPlayersIn++;
        winningPlayer = index;
      }
    });
    if (numPlayersIn === 1) {
      players[self.roomId].map((player) => (player.isIn = true)); //Reset all players to being in
      io.to(self.roomId).emit("nextRound", previousPlayer, winningPlayer + 1);
    } else {
      let nextPlayer = 0;
      for (
        let i = previousPlayer;
        i < players[self.roomId].length + previousPlayer;
        i++
      ) {
        //Circular array accessing https://stackoverflow.com/questions/17483149/how-to-access-array-in-circular-manner-in-javascript
        if (
          players[self.roomId][
            ((i % players[self.roomId].length) + players[self.roomId].length) %
              players[self.roomId].length
          ].isIn
        ) {
          console.log(
            "next player is: " +
              (((i % players[self.roomId].length) +
                players[self.roomId].length) %
                players[self.roomId].length)
          );
          nextPlayer =
            ((i % players[self.roomId].length) + players[self.roomId].length) %
            players[self.roomId].length;
          io.to(self.roomId).emit(
            "nextTurn",
            previousPlayer,
            2,
            nextPlayer + 1,
            bidNumber
          );
          break;
        }
      }
    }
  });

  socket.on(
    "readyForNextHouseTurn",
    function (playerNumber, winningPlayer, moneyPhase = false) {
      players[self.roomId][playerNumber - 1].ready = true;
      let allReady = true;
      players[self.roomId].forEach((player) => {
        if (!player.ready) {
          allReady = false;
        }
      });

      if (!moneyPhase) {
        //Continuing with the house phase
        if (allReady) {
          players[self.roomId].map((player) => (player.ready = false));
          io.to(self.roomId).emit("dealCards", winningPlayer);
        }
      } else {
        //Entering the money phase
        if (allReady) {
          players[self.roomId].map((player) => (player.ready = false));
          console.log("Entering the money phase");
          io.to(self.roomId).emit("moneyPhase");
          io.to(self.roomId).emit("nextMoneyTurn");
        }
      }
    }
  );

  socket.on("readyForNextMoneyTurn", function (playerNumber) {
    players[self.roomId][playerNumber - 1].ready = true;
    let allReady = true;
    players[self.roomId].forEach((player) => {
      if (!player.ready) {
        allReady = false;
      }
    });
    if (allReady && !gameEnd[self.roomId]["gameEnd"]) {
      players[self.roomId].map((player) => (player.ready = false));
      io.to(self.roomId).emit("nextMoneyTurn");
    } else if (allReady && gameEnd[self.roomId]["gameEnd"]) {
      io.to(self.roomId).emit("endGame");
    }
  });
  socket.on("nextMoneyTurn", function () {
    io.to(self.roomId).emit("nextMoneyTurn");
  });

  socket.on("dealCards", function (winningPlayer) {
    io.to(self.roomId).emit("dealCards", winningPlayer);
  });

  socket.on("cardPlayed", function (cardValue, playerNumber) {
    players[self.roomId][playerNumber - 1].playedHouse = true;
    io.to(self.roomId).emit("cardPlayed", cardValue, playerNumber);
    //Check if all players have played a card
    flipCards = true;
    players[self.roomId].forEach((player) => {
      if (!player.playedHouse) {
        flipCards = false;
      }
    });
    if (flipCards) {
      players[self.roomId].map((player) => {
        player.playedHouse = false;
      });
      io.to(self.roomId).emit("flipCards");
    }
  });
  socket.on("endGame", function () {
    gameEnd[self.roomId]["gameEnd"] = true;
  });

  socket.on("restartGame", function () {
    io.to(self.roomId).emit("restartGame");
  });

  socket.on("disconnect", function () {
    //TODO: remove the roomId from players if all players disconnect
    console.log("A user disconnected");
    try {
      players[self.roomId] = players[self.roomId].filter(
        (player) => player.playerId !== socket.id
      );
    } catch {}
    //Update the room with the correct players if in a room
    if (self.roomId) {
      let roomPlayers = [];
      players[self.roomId].forEach((player) =>
        roomPlayers.push(player["playerName"])
      );
      if (players[self.roomId].length !== 0) {
        //Update the room for the other players if there are still players in the room
        io.to(self.roomId).emit("playerJoined", roomPlayers, self.roomId);
      } else {
        //Remove the room key from players if no players are in the room anymore
        delete players[self.roomId];
      }
      console.log(players);
    }
  });
});
http.listen(3000, function () {
  console.log("Server started!");
});
