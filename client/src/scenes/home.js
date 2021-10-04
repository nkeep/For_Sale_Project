import io from "socket.io-client";

export default class Home extends Phaser.Scene {
	constructor() {
		super({
			key: "Home",
		});
	}

	preload() {
		this.load.baseURL = "https://extras.natekeep.com/forsale-media/";
		this.load.setCORS("anonymous");
		this.load.crossOrigin = "anonymous";
		this.load.image("forsale", "forsale.jpg");
	}
	create() {
		let self = this;

		this.isPlayerA = false;
		this.playerName;
		this.playerNumber = 0;

		self.socket = io("https://extras.natekeep.com", {
			path: "/forsale-server",
		});
		//self.socket = io("localhost:3000", { path: "/forsale-server" });
		self.socket.on("connect", function () {
			self.isPlayerA = false;
			self.playerNumber = 0;
			console.log("Connected to server!");
		});

		this.background = this.add.image(640, 390, "forsale");

		this.buttons = self.add.group();

		this.joinGameBox = this.add
			.rectangle(640, 460, 260, 80, 0x00ff00)
			.setInteractive()
			.on("pointerover", function () {
				self.joinGameBox.setFillStyle(0x66aa33);
			})
			.on("pointerout", function () {
				self.joinGameBox.setFillStyle(0x00ff00);
			})
			.on("pointerdown", function () {
				self.buttons.setVisible(false);
				self.backButton.setVisible(true);
				self.joinElements.setVisible(true);
			});
		this.createGameBox = this.add
			.rectangle(640, 600, 260, 80, 0x00ff00)
			.setInteractive()
			.on("pointerover", function () {
				self.createGameBox.setFillStyle(0x66aa33);
			})
			.on("pointerout", function () {
				self.createGameBox.setFillStyle(0x00ff00);
			})
			.on("pointerdown", function () {
				self.buttons.setVisible(false);
				self.backButton.setVisible(true);
				self.createElements.setVisible(true);
			});
		this.joinGameText = this.add
			.text(
				self.joinGameBox.getCenter().x,
				self.joinGameBox.getCenter().y,
				["Join Game"]
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);
		this.createGameText = this.add
			.text(
				self.createGameBox.getCenter().x,
				self.createGameBox.getCenter().y,
				["Create Game"]
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);

		this.buttons
			.add(self.joinGameBox)
			.add(self.createGameBox)
			.add(self.joinGameText)
			.add(self.createGameText);
		this.backBox = this.add
			.rectangle(100, 720, 100, 50, 0xff0000)
			.setInteractive()
			.on("pointerover", function () {
				self.backBox.setFillStyle(0xbb0000);
			})
			.on("pointerout", function () {
				self.backBox.setFillStyle(0xff0000);
			})
			.on("pointerdown", function () {
				self.buttons.setVisible(true);
				self.backButton.setVisible(false);
				self.joinElements.setVisible(false);
				self.createElements.setVisible(false);
				self.roomIdText.setVisible(false);
				if (self.players.getChildren()[0].visible) {
					self.players.setVisible(false);
					self.socket.disconnect();
					self.socket.connect();
				}
			});
		this.backText = this.add
			.text(
				self.backBox.getCenter().x,
				self.backBox.getCenter().y,
				"Back"
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);
		this.backButton = this.add.group();
		this.backButton.add(self.backBox).add(self.backText).setVisible(false);

		let nickNameForm = `<input type="text" name="nickname" placeholder="Nickname" style="font-size: 32px; width:260px; height:50px;">`;
		let roomIdForm = `<input type="text" name="roomid" placeholder="Room Id" style="font-size: 32px; width:260px; height:50px;">`;
		this.nickName = this.add
			.dom(self)
			.createFromHTML(nickNameForm)
			.setPosition(
				self.joinGameBox.getCenter().x,
				self.joinGameBox.getCenter().y
			);
		this.roomId = this.add
			.dom(self)
			.createFromHTML(roomIdForm)
			.setPosition(
				self.createGameBox.getCenter().x,
				self.createGameBox.getCenter().y - 50
			);
		this.joinBox = this.add
			.rectangle(640, 660, 260, 80, 0x00ff00)
			.setInteractive()
			.on("pointerover", function () {
				self.joinBox.setFillStyle(0x66aa33);
			})
			.on("pointerout", function () {
				self.joinBox.setFillStyle(0x00ff00);
			})
			.on("pointerdown", function () {
				let nickName = self.nickName.getChildByName("nickname");
				let roomId = self.roomId.getChildByName("roomid");
				if (nickName.value && roomId.value) {
					self.playerName = nickName.value;
					self.socket.emit("joinRoom", roomId.value, nickName.value);
				}
			});
		this.joinText = this.add
			.text(
				self.joinBox.getCenter().x,
				self.joinBox.getCenter().y,
				"Join"
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);
		this.joinElements = this.add
			.group()
			.add(self.nickName)
			.add(self.roomId)
			.add(self.joinBox)
			.add(self.joinText)
			.setVisible(false);

		this.createBox = this.add
			.rectangle(640, 560, 260, 80, 0x00ff00)
			.setInteractive()
			.on("pointerover", function () {
				self.createBox.setFillStyle(0x66aa33);
			})
			.on("pointerout", function () {
				self.createBox.setFillStyle(0x00ff00);
			})
			.on("pointerdown", function () {
				let nickName = self.nickName.getChildByName("nickname");
				if (nickName.value) {
					let roomId = makeid(5);
					console.log(roomId);
					self.socket.emit("createRoom", roomId, nickName.value);
					self.playerName = nickName.value;
				}
				self.createElements.setVisible(false);
			});
		this.createText = this.add
			.text(
				self.createBox.getCenter().x,
				self.createBox.getCenter().y,
				"Create"
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);
		this.createElements = this.add
			.group()
			.add(self.nickName)
			.add(self.createBox)
			.add(self.createText)
			.setVisible(false);

		this.startGameBox = this.add
			.rectangle(640, 700, 260, 80, 0x00ff00)
			.setInteractive()
			.on("pointerover", function () {
				self.startGameBox.setFillStyle(0x66aa33);
			})
			.on("pointerout", function () {
				self.startGameBox.setFillStyle(0x00ff00);
			})
			.on("pointerdown", function () {
				self.socket.emit("loadGame");
			});

		this.startGameText = this.add
			.text(
				self.startGameBox.getCenter().x,
				self.startGameBox.getCenter().y,
				"Start Game"
			)
			.setColor("#000000")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setOrigin(0.5);

		this.startGameButton = this.add
			.group()
			.add(self.startGameBox)
			.add(self.startGameText)
			.setVisible(false);

		this.player1 = this.add
			.text(320, 460, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);
		this.player2 = this.add
			.text(320, 600, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);
		this.player3 = this.add
			.text(640, 460, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);
		this.player4 = this.add
			.text(640, 600, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);
		this.player5 = this.add
			.text(960, 460, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);
		this.player6 = this.add
			.text(960, 600, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5);

		this.players = this.add
			.group()
			.add(self.player1)
			.add(self.player2)
			.add(self.player3)
			.add(self.player4)
			.add(self.player5)
			.add(self.player6);

		this.roomIdText = this.add
			.text(1100, 700, [""])
			.setColor("#ffffff")
			.setFontSize(40)
			.setFontFamily("Trebuchet MS")
			.setStroke("#000000", 6)
			.setOrigin(0.5)
			.setVisible(false)
			.setInteractive()
			.on("pointerover", function () {
				self.roomIdText.setColor("#ff69b4");
			})
			.on("pointerout", function () {
				self.roomIdText.setColor("#ffffff");
			})
			.on("pointerdown", function () {
				navigator.clipboard
					.writeText(self.roomIdText.text)
					.then(function () {
						let clipboardNotif = self.add
							.text(1100, 650, ["Copied to clipboard!"])
							.setColor("#ffffff")
							.setFontSize(30)
							.setFontFamily("Trebuchet MS")
							.setStroke("#000000", 6)
							.setOrigin(0.5);
						self.time.addEvent({
							delay: 2000,
							callback: function () {
								clipboardNotif.setVisible(false).destroy();
							},
							callbackScope: this,
							repeat: 0,
						});
					});
			});

		self.socket.on("playerJoined", function (roomPlayers, roomId) {
			if (self.playerNumber === 0) {
				self.playerNumber = roomPlayers.length;
			}
			console.log(roomPlayers);
			self.joinElements.setVisible(false);
			if (!self.roomIdText.visible) {
				self.roomIdText.setText(roomId).setVisible(true);
			}
			self.players.setVisible(true);
			self.players
				.getChildren()
				.forEach((child, index) => child.setText(roomPlayers[index]));
			if (roomPlayers.length >= 3 && self.isPlayerA) {
				self.startGameButton.setVisible(true);
			}
		});

		self.socket.on("isPlayerA", function () {
			self.isPlayerA = true;
		});

		self.socket.on("loadGame", function (players) {
			console.log("starting the game");
			self.scene.start("Game", {
				isPlayerA: self.isPlayerA,
				socket: self.socket,
				playerNames: players,
				playerNumber: self.playerNumber,
			});
		});

		function makeid(length) {
			var result = "";
			var characters =
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			var charactersLength = characters.length;
			for (var i = 0; i < length; i++) {
				result += characters.charAt(
					Math.floor(Math.random() * charactersLength)
				);
			}
			return result;
		}
	}
}
