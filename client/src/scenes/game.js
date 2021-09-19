import HouseCard from "../helpers/housecard";
import MoneyCard from "../helpers/moneycard";
import Player from "../helpers/player";
import Zone from "../helpers/zone";
import io from "socket.io-client";
import Dealer from "../helpers/dealer";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
  }
  init(data) {
    this.isPlayerA = data.isPlayerA;
    this.socket = data.socket;
    this.playerNames = data.playerNames;
    this.playerNumber = data.playerNumber;
  }
  preload() {
    this.load.baseURL = "https://natekeep.jumpingcrab.com/forsale-media/";
    this.load.setCORS("anonymous");
    this.load.crossOrigin = "anonymous";
    for (let i = 0; i < 30; i++) {
      let title = "cards_";
      let sprite = this.load.image(
        "house" + (i + 1).toString(),
        title + (i + 1).toString() + ".jpg"
      );
    }
    for (let i = 31; i < 61; i++) {
      let title = "cards_";
      let sprite = this.load.image(
        "money" + (i - 30).toString(),
        title + i.toString() + ".jpg"
      );
    }
    let coin = this.load.image("coin1", "coin1.jpg");
    let houseBack = this.load.image("houseBack", "houseback.PNG");
    let moneyBack = this.load.image("moneyBack", "moneyback.PNG");
  }
  create() {
    let self = this;

    this.opponentCards = [];

    this.dealer = new Dealer(this);
    this.player1 = new Player(this);
    this.player1.setValues(1, 426, 540);
    this.player2 = new Player(this);
    this.player2.setValues(2, 80, 360);
    this.player3 = new Player(this);
    this.player3.setValues(3, 426, 80);
    this.player4 = new Player(this);
    this.player4.setValues(4, 852, 80);
    this.player5 = new Player(this);
    this.player5.setValues(5, 1200, 360);
    this.player6 = new Player(this);
    this.player6.setValues(6, 852, 540);

    this.playerList = [
      this.player1,
      this.player2,
      this.player3,
      this.player4,
      this.player5,
      this.player6,
    ];

    console.log("adding players");
    for (let i = 0; i < self.playerNames.length; i++) {
      self.playerList[i].render(self.playerNames[i]);
    }

    this.activePlayers = self.playerNames.length;
    this.playerTurn = 0;
    this.currentBid = 0;
    this.winText;
    console.log(this.playerList);

    this.houseCards = [];
    this.moneyCards = [];

    console.log(this.moneyCards);
    console.log(this.houseCards);
    console.log(this.isPlayerA);

    this.coinBalanceText = self.add
      .text(50, 720, [""])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS")
      .setColor("#FFFF00");

    this.selectedCard; //Stores which card is selected for money phase

    this.betNumberValue = 0;
    self.betNumber = self.add
      .text(240, 720, [self.betNumberValue])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS");
    self.minusButton = self.add
      .text(200, 720, ["-"])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS")
      .setInteractive();
    self.minusButton.on("pointerover", function () {
      self.minusButton.setColor("#ff0000");
    });
    self.minusButton.on("pointerout", function () {
      self.minusButton.setColor("#ffffff");
    });
    self.minusButton.on("pointerdown", function () {
      if (self.betNumberValue !== 0) {
        self.betNumberValue--;
        self.betNumber.setText(self.betNumberValue);
      }
    });

    self.plusButton = self.add
      .text(280, 720, ["+"])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS")
      .setInteractive();
    self.plusButton.on("pointerover", function () {
      self.plusButton.setColor("#00ff00");
    });
    self.plusButton.on("pointerout", function () {
      self.plusButton.setColor("#ffffff");
    });
    self.plusButton.on("pointerdown", function () {
      if (
        self.betNumberValue < self.playerList[self.playerNumber - 1].coinBalance
      ) {
        self.betNumberValue++;
        self.betNumber.setText(self.betNumberValue);
      }
    });

    self.raiseButton = self.add
      .text(400, 720, ["Raise"])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS")
      .setInteractive();
    self.raiseButton.on("pointerover", function () {
      self.raiseButton.setColor("#00ff00");
    });
    self.raiseButton.on("pointerout", function () {
      self.raiseButton.setColor("#ffffff");
    });
    self.raiseButton.on("pointerdown", function () {
      if (
        self.betNumberValue > self.currentBid &&
        self.betNumberValue <=
          self.playerList[self.playerNumber - 1].coinBalance
      ) {
        self.bidHud.setVisible(false);
        self.socket.emit("raise", self.playerNumber, self.betNumberValue);
      }
    });
    self.passButton = self.add
      .text(540, 720, ["Pass"])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS")
      .setInteractive();
    self.passButton.on("pointerover", function () {
      self.passButton.setColor("#ff0000");
    });
    self.passButton.on("pointerdown", function () {
      self.bidHud.setVisible(false);
      self.socket.emit("pass", self.playerNumber, self.currentBid);
    });
    self.passButton.on("pointerout", function () {
      self.passButton.setColor("#ffffff");
    });

    self.bidHud = self.add.group();
    self.bidHud.add(self.betNumber);
    self.bidHud.add(self.raiseButton);
    self.bidHud.add(self.passButton);
    self.bidHud.add(self.plusButton);
    self.bidHud.add(self.minusButton);
    self.bidHud.setVisible(false);

    self.playRectangle = self.add
      .rectangle(700, 720, 100, 50, 0x00ff00)
      .setInteractive();
    self.playRectangleText = self.add
      .text(660, 700, ["Play"])
      .setFontSize(40)
      .setFontFamily("Trebuchet MS");
    self.playRectangle.on("pointerover", function () {
      self.playRectangle.setFillStyle(0x66aa33);
    });
    self.playRectangle.on("pointerout", function () {
      self.playRectangle.setFillStyle(0x00ff00);
    });
    self.playRectangle.on("pointerdown", function () {
      if (self.selectedCard) {
        self.playerList[self.playerNumber - 1].setCardsInteractive(false);
        self.socket.emit(
          "cardPlayed",
          self.selectedCard.data.values.value,
          self.playerNumber
        );
        self.playButton.setVisible(false);
        self.selectedCard.destroy();
        self.selectedCard = null;
      }
    });
    self.playButton = self.add.group();
    self.playButton.add(self.playRectangle);
    self.playButton.add(self.playRectangleText);
    self.playButton.setVisible(false);

    self.playerHand = self.add.group();

    if (self.isPlayerA) {
      console.log("this is player A");
      self.dealText = self.add
        .text(150, 350, ["DEAL CARDS"])
        .setFontSize(18)
        .setFontFamily("Trebuchet MS")
        .setColor("#00ffff")
        .setInteractive();

      self.dealText.on("pointerdown", function () {
        if (self.activePlayers >= 3) {
          this.setVisible(false);
          //Generate the decks
          for (let i = 0; i < 30; i++) {
            let card = new HouseCard(self);
            card.setValues(i + 1, "house" + (i + 1).toString());
            self.houseCards.push(card);
          }
          self.houseCards.sort(() => Math.random() - 0.5);

          let card = new MoneyCard(self);
          card.setValues(0, "money1");
          self.moneyCards.push(card);
          let card0 = new MoneyCard(self);
          card0.setValues(0, "money2");
          self.moneyCards.push(card0);

          for (let i = 2; i < 30; i++) {
            let card = new MoneyCard(self);
            card.setValues(1 + Math.floor(i / 2), "money" + (i + 1).toString());
            self.moneyCards.push(card);
          }
          self.moneyCards.sort(() => Math.random() - 0.5);
          //Remove cards based on player count
          if (self.activePlayers === 3) {
            self.houseCards.splice(0, 6);
            self.moneyCards.splice(0, 6);
          } else if (self.activePlayers === 4) {
            self.houseCards.splice(0, 2);
            self.moneyCards.splice(0, 2);
          }
          console.log(self.houseCards);
          self.socket.emit("gameStart", self.houseCards, self.moneyCards);
          self.socket.emit("dealCards", 1);
        }
      });

      self.dealText.on("pointerover", function () {
        self.dealText.setColor("#ff69b4");
      });

      self.dealText.on("pointerout", function () {
        self.dealText.setColor("#00ffff");
      });
    }

    this.restartText = this.add
      .text(1100, 700, ["Restart Game"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive()
      .setVisible(false)
      .on("pointerover", function () {
        self.restartText.setColor("#ff69b4");
      })
      .on("pointerout", function () {
        self.restartText.setColor("#00ffff");
      })
      .on("pointerdown", function () {
        self.restartText.setVisible(false);
        self.socket.emit("restartGame");
      });

    this.socket.on("dealCards", function (winningPlayer) {
      self.playerTurn = winningPlayer; //Set winning player as the starter of this round
      self.playerList[winningPlayer - 1].setActive(1); //Set the winning player to green
      if (self.playerNumber === winningPlayer) {
        self.bidHud.setVisible(true);
      }
      self.dealer.dealCards(0.15);
    });

    this.socket.on("startGame", function (houseCards, moneyCards) {
      for (let i = self.activePlayers; i < 6; i++) {
        //Removes players not in game
        self.playerList.pop();
      }
      //Set coin balance
      self.coinBalanceText.setText(
        self.playerList[self.playerNumber - 1].coinBalance
      );
      if (self.playerNumber !== 1) {
        //Sync the cards generated by player1 to all other players
        houseCards.forEach((card) => {
          let newCard = new HouseCard(self);
          newCard.setValues(card.value, card.sprite);
          self.houseCards.push(newCard);
        });
        moneyCards.forEach((card) => {
          let newCard = new MoneyCard(self);
          newCard.setValues(card.value, card.sprite);
          self.moneyCards.push(newCard);
        });
      }
    });
    this.socket.on(
      "nextTurn",
      function (previousPlayer, state, nextPlayer, bidNumber) {
        self.playerTurn = nextPlayer;
        self.currentBid = bidNumber;
        self.playerList[previousPlayer - 1].setActive(state);
        if (state === 0) {
          //Previous player is still in, display what they bet
          self.playerList[previousPlayer - 1].setBidNumber(bidNumber);
        }
        self.playerList[nextPlayer - 1].setActive(1);
        if (self.playerTurn === self.playerNumber) {
          //It is this client's turn
          self.bidHud.setVisible(true);
          self.betNumberValue = bidNumber + 1;
          self.betNumber.setText(self.betNumberValue);
        }
        if (state === 2) {
          //Set their bid number to blank since they are out
          self.playerList[previousPlayer - 1].setBidNumber("");
          self.playerList[previousPlayer - 1].updateCoinBalance(false);
          //Add the lowest card in the pool to the previous player's deck
          let lowest_value = 31;
          let lowest_index = -1;
          for (let i = 0; i < self.dealer.houseCardsInPlay; i++) {
            if (self.houseCards[i].value < lowest_value) {
              lowest_value = self.houseCards[i].value;
              lowest_index = i;
            }
          }
          self.playerList[previousPlayer - 1].houseDeck.push(
            self.houseCards[lowest_index]
          );
          self.houseCards[lowest_index].card.destroy();
          self.houseCards.splice(lowest_index, 1); //Remove the card from the cards that are out
          self.dealer.houseCardsInPlay--;
        }
      }
    );

    this.socket.on("nextRound", function (secondPlacePlayer, winningPlayer) {
      //Add the last 2 cards to the last 2 players' decks
      self.currentBid = 0;
      self.betNumberValue = 1;
      self.betNumber.setText(self.betNumberValue);
      if (self.houseCards[0].value > self.houseCards[1].value) {
        self.playerList[secondPlacePlayer - 1].houseDeck.push(
          self.houseCards[1]
        );
        self.playerList[winningPlayer - 1].houseDeck.push(self.houseCards[0]);
      } else {
        self.playerList[secondPlacePlayer - 1].houseDeck.push(
          self.houseCards[0]
        );
        self.playerList[winningPlayer - 1].houseDeck.push(self.houseCards[1]);
      }
      //Update these players' coin balances and remove the 2 images
      self.playerList[secondPlacePlayer - 1].updateCoinBalance(false);
      self.playerList[winningPlayer - 1].updateCoinBalance(true); //True because this player won
      self.houseCards[0].card.destroy();
      self.houseCards[1].card.destroy();
      self.dealer.houseCardsInPlay -= 2;
      self.houseCards.splice(0, 2); //Remove those 2 cards from the main deck

      //Reset player coloring and their bid number
      self.playerList.forEach((player) => {
        player.setActive(0);
        player.setBidNumber("");
      });
      if (self.houseCards.length > 0 && self.playerNumber === 1) {
        //The deck is not empty, continue playing
        self.socket.emit("dealCards", winningPlayer);
      } else if (self.houseCards.length === 0 && self.playerNumber === 1) {
        self.socket.emit("moneyPhase");
      }
    });
    this.socket.on("moneyPhase", function () {
      // self.zone = new Zone(self);
      // self.dropZone = self.zone.renderZone();
      // self.outline = self.zone.renderOutline(self.dropZone);
      self.bidHud.setVisible(false);
      self.playerList[self.playerNumber - 1].renderHand();
    });
    this.socket.on("nextMoneyTurn", function () {
      self.playerList[self.playerNumber - 1].setCardsInteractive(true);
      self.dealer.moneyCardsInPlay = 0;
      self.dealer.dealMoneyCards();
      self.playButton.setVisible(true);
    });

    this.socket.on("cardPlayed", function (cardValue, player) {
      self.playerList[player - 1].playedCardValue = cardValue;
      self.playerList[player - 1].showFaceDown();
    });

    this.socket.on("flipCards", function () {
      self.playerList.forEach((player) => {
        player.flipCard();
      });
      self.time.addEvent({
        delay: 2000,
        callback: determineMoney,
        callbackScope: this,
        repeat: 0,
      });
    });

    this.socket.on("endGame", function () {
      let winningPlayerIndex;
      let highestMoney = -1;
      self.playerList.forEach((player, index) => {
        let playerScore = player.renderScore();
        if (playerScore > highestMoney) {
          highestMoney = playerScore;
          winningPlayerIndex = index;
        }
      });
      self.winText = self.add
        .text(340, 300, [
          "Player " + self.playerList[winningPlayerIndex].playerName + " Wins!",
        ])
        .setFontSize(80)
        .setFontFamily("Trebuchet MS")
        .setAlign("center");
      if (self.isPlayerA) {
        self.restartText.setVisible(true);
      }
    });

    this.socket.on("restartGame", function () {
      //TODO: reshuffle decks and reset all values for all players
    });

    function determineMoney() {
      for (let i = 0; i < self.activePlayers; i++) {
        let highestValue = -1;
        let highestPlayerIndex;
        self.playerList.forEach((player, index) => {
          if (player.playedCardValue > highestValue) {
            highestValue = player.playedCardValue;
            highestPlayerIndex = index;
          }
        });
        let highestMoney = -1;
        let highestMoneyIndex = -1;
        for (let j = 0; j < self.activePlayers - i; j++) {
          if (self.moneyCards[j].value > highestMoney) {
            highestMoney = self.moneyCards[j].value;
            highestMoneyIndex = j;
          }
        }
        self.playerList[highestPlayerIndex].moneyValue += highestMoney;
        self.playerList[highestPlayerIndex].playedCardValue = 0;

        console.log(self.moneyCards[highestMoneyIndex]);
        self.moneyCards[highestMoneyIndex].card.destroy();
        self.moneyCards.splice(highestMoneyIndex, 1);
        self.playerList.forEach((player) => {
          player.playedCard.destroy();
        });
        console.log(self.playerList[highestPlayerIndex].playerId, highestMoney);
        self.playerList[highestPlayerIndex].playedCardValue = 0;
      }
      if (self.moneyCards.length === 0 && self.playerNumber === 1) {
        self.socket.emit("endGame");
      }
      self.socket.emit("readyForNextTurn", self.playerNumber); //This is needed because otherwise if it's controlled by one player then they can get desynced
    }

    // this.input.on("pointerover", function (point, gameObject) {
    //   gameObject.setTint(0xcc69b4);
    // });
    // this.input.on("pointerout", function (pointer, gameObject) {
    //   gameObject.setTint();
    // });
    // this.input.on("pointerdown", function (pointer, gameObject) {
    //   self.selectedCard.setTint();
    //   self.selectedCard = gameObject;
    //   gameObject.setTint(0xff69b4);
    // });

    // this.input.on("dragstart", function (pointer, gameObject) {
    //   gameObject.setTint(0xff69b4);
    //   self.children.bringToTop(gameObject);
    // });

    // this.input.on("dragend", function (pointer, gameObject, dropped) {
    //   gameObject.setTint();
    //   if (!dropped) {
    //     //If not dropped into a drop zone, return to where it started to be dragged from
    //     gameObject.x = gameObject.input.dragStartX;
    //     gameObject.y = gameObject.input.dragStartY;
    //   }
    // });

    // this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
    //   gameObject.x = dragX;
    //   gameObject.y = dragY;
    // });

    // this.input.on("drop", function (pointer, gameObject, dropZone) {
    //   gameObject.x = dropZone.x;
    //   gameObject.y = dropZone.y;
    //   gameObject.setScale(0.25, 0.25);
    //   gameObject.disableInteractive();
    //   self.playerList[self.playerNumber - 1].setCardsInteractive(false);
    //   self.socket.emit(
    //     "cardPlayed",
    //     gameObject.data.values.value,
    //     self.playerNumber
    //   );
    // });
  }
  update() {}
}
