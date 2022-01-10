import HouseCard from "../helpers/housecard";
import MoneyCard from "../helpers/moneycard";
import Player from "../helpers/player";
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
		this.load.baseURL = "https://extras.natekeep.com/forsale-media/";
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
		let coin = this.load.image("coin", "coin.jpg");
		let houseBack = this.load.image("houseBack", "houseback.PNG");
		let moneyBack = this.load.image("moneyBack", "moneyback.PNG");
		let tablebackground = this.load.image(
			"tablebackground",
			"table-background.png"
		);
	}
	create() {
		let self = this;

		this.background = this.add.image(640, 390, "tablebackground");

		this.opponentCards = [];

		this.dealer = new Dealer(this);
		this.player1 = new Player(this);
		this.player1.setValues(1, 426, 590, 426, 490);
		this.player2 = new Player(this);
		this.player2.setValues(2, 100, 310, 180, 310);
		this.player3 = new Player(this);
		this.player3.setValues(3, 426, 50, 426, 150);
		this.player4 = new Player(this);
		this.player4.setValues(4, 852, 50, 852, 150);
		this.player5 = new Player(this);
		this.player5.setValues(5, 1180, 310, 1100, 310);
		this.player6 = new Player(this);
		this.player6.setValues(6, 852, 590, 852, 490);

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
		this.numRounds;
		this.deckCard;
		this.hoveredDeckCards;
		this.currentRound = 1;
		this.playerTurn = 0;
		this.currentBid = 0;
		this.moneyText;
		this.winText;
		this.winningPlayerIndex;
		this.isMoneyPhase = false;
		this.timer = this.add
			.text(1100, 700, [""])
			.setFontFamily("Trebuchet MS")
			.setFontSize(30)
			.setColor("#FFFFFF")
			.setStroke("#000000", 2)
			.setVisible(false);

		this.timerEvent;
		console.log(this.playerList);

		this.houseCards = [];
		this.moneyCards = [];

		this.roundCounterText = self.add
			.text(1150, 50, [""])
			.setFontSize(30)
			.setFontFamily("Trebuchet MS")
			.setColor("#FFFFFF")
			.setOrigin(0.5);

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
				self.betNumberValue <
				self.playerList[self.playerNumber - 1].coinBalance
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
				self.socket.emit(
					"raise",
					self.playerNumber,
					self.betNumberValue
				);
				self.timerEvent.remove();
				self.timerEvent = null;
				self.timer.setVisible(false);
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
			self.timerEvent.remove();
			self.timerEvent = null;
			self.timer.setVisible(false);
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
				self.playerList[self.playerNumber - 1].setCardsInteractive(
					false
				);
				self.socket.emit(
					"cardPlayed",
					self.selectedCard.data.values.value,
					self.playerNumber
				);
				self.playButton.setVisible(false);
				self.selectedCard.destroy();
				self.selectedCard = null;
				self.timerEvent.remove();
				self.timerEvent = null;
				self.timer.setVisible(false);
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
				.text(1100, 700, ["DEAL CARDS"])
				.setFontSize(18)
				.setFontFamily("Trebuchet MS")
				.setColor("#00ffff")
				.setInteractive();

			self.dealText.on("pointerdown", function () {
				if (self.activePlayers >= 3) {
					this.setVisible(false);
					//Generate the decks
					generateDecks();

					console.log(self.houseCards);
					self.socket.emit(
						"gameStart",
						self.houseCards,
						self.moneyCards
					);
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
				startTimer(15);
			}
			self.dealer.dealCards(0.15);
		});

		this.socket.on("startGame", function (houseCards, moneyCards) {
			let numPlayers = self.playerList.length;
			switch (self.activePlayers) {
				case 3:
					self.numRounds = 8;
					break;
				case 4:
					self.numRounds = 7;
					break;
				case 5:
					self.numRounds = 6;
					break;
				case 6:
					self.numRounds = 5;
					break;
				default:
					console.log("Invalid number of players");
			}
			self.currentRound = 1;
			updateRoundCounter();
			for (let i = self.activePlayers; i < numPlayers; i++) {
				//Removes players not in game
				self.playerList.pop();
			}
			//Update players' coin balance based on number of players
			if (self.playerList.length > 4) {
				self.playerList.map((player) => (player.coinBalance = 14));
			}
			console.log(self.playerList);
			//Set coin balance
			self.coinBalanceText.setText(
				self.playerList[self.playerNumber - 1].coinBalance
			);
			if (self.playerNumber !== 1) {
				//Sync the cards generated by player1 to all other players
				self.houseCards = [];
				self.moneyCards = [];
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
					console.log("previous player stayed in");
					self.playerList[previousPlayer - 1].setBidNumber(bidNumber);
				}
				self.playerList[nextPlayer - 1].setActive(1);
				if (state === 2) {
					console.log("previous player passed");
					//Set their bid number to blank since they are out
					self.playerList[previousPlayer - 1].updateCoinBalance(
						false
					);
					self.playerList[previousPlayer - 1].setBidNumber("");
					//Add the lowest card in the pool to the previous player's deck
					let lowest_value = 31;
					let lowest_index = -1;
					for (let i = 0; i < self.dealer.houseCardsInPlay; i++) {
						if (self.houseCards[i].value < lowest_value) {
							lowest_value = self.houseCards[i].value;
							lowest_index = i;
						}
					}
					console.log(lowest_index, lowest_value);
					if (self.game.hasFocus) {
						let tween = self.tweens.add({
							targets: self.houseCards[lowest_index].card,
							duration: 500,
							x: self.playerList[previousPlayer - 1].x,
							y: self.playerList[previousPlayer - 1].y,
							loop: 0,
							onComplete: function () {
								tween.remove();
								nextTurn(self, lowest_index, previousPlayer);
							},
						});
					} else {
						nextTurn(self, lowest_index, previousPlayer);
					}
				}
				if (self.playerTurn === self.playerNumber) {
					//It is this client's turn
					self.bidHud.setVisible(true);
					self.betNumberValue = bidNumber + 1;
					self.betNumber.setText(self.betNumberValue);
					startTimer(15);
				}
			}
		);

		this.socket.on(
			"nextRound",
			function (secondPlacePlayer, winningPlayer) {
				//Add the last 2 cards to the last 2 players' decks
				self.currentBid = 0;
				self.betNumberValue = 1;
				self.betNumber.setText(self.betNumberValue);
				let highValue = -1;
				let highIndex, lowIndex;
				//Get the highest value
				for (let i = 0; i < self.activePlayers; i++) {
					if (self.houseCards[i].value > highValue) {
						highValue = self.houseCards[i].value;
						highIndex = i;
					}
				}
				//Get the second highest value
				let secondHighValue = -1;
				for (let i = 0; i < self.activePlayers; i++) {
					if (
						self.houseCards[i].value > secondHighValue &&
						self.houseCards[i].value < highValue
					) {
						secondHighValue = self.houseCards[i].value;
						lowIndex = i;
					}
				}
				if (self.game.hasFocus) {
					let tween = self.tweens.add({
						targets: self.houseCards[highIndex].card,
						duration: 500,
						x: self.playerList[winningPlayer - 1].x,
						y: self.playerList[winningPlayer - 1].y,
						loop: 0,
						onComplete: function () {
							tween.remove();
							self.houseCards[highIndex].card.destroy();
							tween = self.tweens.add({
								targets: self.houseCards[lowIndex].card,
								duration: 500,
								x: self.playerList[secondPlacePlayer - 1].x,
								y: self.playerList[secondPlacePlayer - 1].y,
								loop: 0,
								onComplete: function () {
									tween.remove();
									nextRound(
										self,
										lowIndex,
										highIndex,
										winningPlayer,
										secondPlacePlayer
									);
								},
							});
						},
					});
				} else {
					self.houseCards[highIndex].card.destroy();
					nextRound(
						self,
						lowIndex,
						highIndex,
						winningPlayer,
						secondPlacePlayer
					);
				}

				if (
					(self.playerNumber === winningPlayer ||
						self.playerNumber === secondPlacePlayer) &&
					self.currentRound === 1
				) {
					self.playerList[self.playerNumber - 1].showDeckCard();
				}
				//Update round counter
				self.currentRound += 1;
				updateRoundCounter();
			}
		);
		this.socket.on("moneyPhase", function () {
			self.bidHud.setVisible(false);
			self.playerList[self.playerNumber - 1].renderHand();
			self.isMoneyPhase = true;
			self.currentRound = 0;
			updateRoundCounter();
			//Remove the hoverable deck card
			self.hoveredDeckCards.clear(true, true);
			self.deckCard.destroy();
			self.hoveredDeckCards = null;
			self.deckCard = null;
		});
		this.socket.on("nextMoneyTurn", function () {
			self.playerList[self.playerNumber - 1].setCardsInteractive(true);
			self.dealer.moneyCardsInPlay = 0;
			self.dealer.dealMoneyCards();
			self.playButton.setVisible(true);
			self.currentRound += 1;
			updateRoundCounter();
			startTimer(20);
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
				.text(640, 325, [
					self.playerList[winningPlayerIndex].playerName + " Wins!",
				])
				.setFontSize(80)
				.setFontFamily("Trebuchet MS")
				.setOrigin(0.5);
			if (self.isPlayerA) {
				self.restartText.setVisible(true);
				self.winningPlayerIndex = winningPlayerIndex;
			}
		});

		this.socket.on("restartGame", function () {
			self.winText.setVisible(false);
			self.moneyText.setVisible(false);
			self.playerList.forEach((player) => {
				player.resetAllValues();
			});
			if (self.isPlayerA) {
				generateDecks();
				self.socket.emit("gameStart", self.houseCards, self.moneyCards);
				self.socket.emit("dealCards", self.winningPlayerIndex + 1);
			}
		});

		function updateRoundCounter() {
			self.roundCounterText.setText(
				"Round " + self.currentRound + "/" + self.numRounds
			);
		}

		function shuffle(array) {
			let currentIndex = array.length,
				randomIndex;

			// While there remain elements to shuffle...
			while (currentIndex != 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;

				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex],
					array[currentIndex],
				];
			}

			return array;
		}

		function generateDecks() {
			self.houseCards = [];
			self.moneyCards = [];
			for (let i = 0; i < 30; i++) {
				let card = new HouseCard(self);
				card.setValues(i + 1, "house" + (i + 1).toString());
				self.houseCards.push(card);
			}
			shuffle(self.houseCards);

			let card = new MoneyCard(self);
			card.setValues(0, "money1");
			self.moneyCards.push(card);
			let card0 = new MoneyCard(self);
			card0.setValues(0, "money2");
			self.moneyCards.push(card0);

			for (let i = 2; i < 30; i++) {
				let card = new MoneyCard(self);
				card.setValues(
					1 + Math.floor(i / 2),
					"money" + (i + 1).toString()
				);
				self.moneyCards.push(card);
			}
			shuffle(self.moneyCards);
			//Remove cards based on player count
			if (self.activePlayers === 3) {
				self.houseCards.splice(0, 6);
				self.moneyCards.splice(0, 6);
			} else if (self.activePlayers === 4) {
				self.houseCards.splice(0, 2);
				self.moneyCards.splice(0, 2);
			}
		}

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
				for (let j = 0; j < self.activePlayers; j++) {
					if (self.moneyCards[j].value >= highestMoney) {
						highestMoney = self.moneyCards[j].value;
						highestMoneyIndex = j;
					}
				}
				console.log(
					self.playerList[highestPlayerIndex],
					self.moneyCards[highestMoneyIndex].value
				);
				console.log("state:", self.game.hasFocus);
				if (self.game.hasFocus) {
					let tween = self.tweens.add({
						targets: self.moneyCards[highestMoneyIndex].card,
						x: self.playerList[highestPlayerIndex].x,
						y: self.playerList[highestPlayerIndex].y,
						duration: 500,
						loop: 0,
						onComplete: function () {
							tween.remove();
						},
					});
				}

				self.playerList[highestPlayerIndex].addMoney(highestMoney);
				self.playerList[highestPlayerIndex].playedCardValue = -1;
				self.moneyCards[highestMoneyIndex].value = -1;
			}

			self.time.addEvent({
				//Remove all the cards after they've been tweened
				delay: 550,
				callback: function () {
					for (let i = 0; i < self.activePlayers; i++) {
						self.moneyCards[i].card.destroy();
					}
					self.moneyCards.splice(0, self.activePlayers);
					self.playerList.forEach((player) => {
						player.playedCard.destroy();
					});
					if (
						self.moneyCards.length === 0 &&
						self.playerNumber === 1
					) {
						self.socket.emit("endGame");
					}
					self.socket.emit(
						"readyForNextMoneyTurn",
						self.playerNumber
					); //This is needed because otherwise if it's controlled by one player then they can get desynced
				},
				callbackScope: this,
				repeat: 0,
			});
		}

		function nextTurn(self, lowest_index, previousPlayer) {
			self.playerList[previousPlayer - 1].houseDeck.push(
				self.houseCards[lowest_index]
			);
			self.houseCards[lowest_index].card.destroy();
			self.houseCards.splice(lowest_index, 1); //Remove card from houseCards deck
			self.dealer.houseCardsInPlay--;
			//Show the hoverable deck if this is the first card added
			if (
				self.currentRound === 1 &&
				self.playerNumber === previousPlayer
			) {
				self.playerList[self.playerNumber - 1].showDeckCard();
			}
		}

		function nextRound(
			self,
			lowIndex,
			highIndex,
			winningPlayer,
			secondPlacePlayer
		) {
			self.houseCards[lowIndex].card.destroy();
			//Add cards to correct players' decks
			self.playerList[winningPlayer - 1].houseDeck.push(
				self.houseCards[highIndex]
			);
			self.playerList[secondPlacePlayer - 1].houseDeck.push(
				self.houseCards[lowIndex]
			);
			//Update these players' coin balances and remove the 2 images
			self.playerList[secondPlacePlayer - 1].updateCoinBalance(false);
			self.playerList[winningPlayer - 1].updateCoinBalance(true); //True because this player won
			self.dealer.houseCardsInPlay -= 2;
			self.houseCards.splice(0, 2); //Removes last 2 cards from deck

			//Reset player coloring and their bid number
			self.playerList.forEach((player) => {
				player.setActive(0);
				player.setBidNumber("");
			});
			if (self.houseCards.length > 0) {
				//The deck is not empty, continue playing
				self.socket.emit(
					"readyForNextHouseTurn",
					self.playerNumber,
					winningPlayer
				);
			} else if (self.houseCards.length === 0) {
				self.socket.emit(
					"readyForNextHouseTurn",
					self.playerNumber,
					winningPlayer,
					true
				); //moneyphase
			}
		}

		function startTimer(seconds) {
			self.timer.setText(seconds).setVisible(true);

			self.timerEvent = self.time.addEvent({
				delay: 1000,
				callback: decreaseTimer,
				callbackScope: this,
				repeat: seconds,
			});
		}

		function decreaseTimer() {
			if (self.timer.text === "0") {
				if (!self.isMoneyPhase) {
					//Automatically pass if the timer runs out
					self.bidHud.setVisible(false);
					self.timer.setVisible(false);
					self.socket.emit(
						"pass",
						self.playerNumber,
						self.currentBid
					);
					self.timerEvent.remove();
					self.timerEvent = null;
				} else {
					//Pick a random card and play it
					let random = Math.floor(
						Math.random() * self.playerHand.getChildren().length
					);
					self.selectedCard = self.playerHand.getChildren()[random];
					//Simulate pressing the play button
					self.playerList[self.playerNumber - 1].setCardsInteractive(
						false
					);
					self.socket.emit(
						"cardPlayed",
						self.selectedCard.data.values.value,
						self.playerNumber
					);
					self.playButton.setVisible(false);
					self.selectedCard.destroy();
					self.selectedCard = null;
					//Remove timer
					self.timer.setVisible(false);
					self.timerEvent.remove();
					self.timerEvent = null;
				}
			} else {
				self.timer.setText(parseInt(self.timer.text) - 1);
			}
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
