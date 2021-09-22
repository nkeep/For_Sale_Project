export default class Player {
  constructor(scene) {
    this.playerId;
    this.playerName;
    this.x;
    this.y;
    this.playX;
    this.playY;
    this.coin;
    this.coinBalance = 18;
    this.playerText;
    this.bidNumberText;
    this.bidNumberValue = 0;
    this.houseDeck = [];
    this.faceDownCard;
    this.playedCard;
    this.playedCardValue;
    this.moneyValue = 0;
    this.playerHand = [];
    this.playerScoreText;

    this.setValues = (id, x, y, playX, playY) => {
      this.playerId = id;
      this.x = x;
      this.y = y;
      this.playX = playX;
      this.playY = playY;
      this.coin = scene.add
        .image(this.playX, this.playY, "coin")
        .setScale(0.25, 0.25)
        .setVisible(false);
    };
    this.render = (name) => {
      this.playerText = scene.add
        .text(this.x, this.y, [name])
        .setFontSize(20)
        .setColor("#ffffff")
        .setStroke("#000000", 4)
        .setFontFamily("Trebuchet MS")
        .setOrigin(0.5);
      this.playerName = name;
    };

    this.setBidNumber = (bid) => {
      if (bid) {
        //If the bid is set to a number, display coin, otherwise don't display coin
        this.coin.setVisible(true);
      } else {
        this.coin.setVisible(false);
      }
      //Update the number
      if (this.bidNumberText) {
        this.bidNumberValue = bid;
        this.bidNumberText.setText(bid);
      } else {
        this.bidNumberValue = bid;
        this.bidNumberText = scene.add
          .text(this.playX, this.playY, [bid])
          .setFontSize(35)
          .setFontFamily("Trebuchet MS")
          .setColor("#ffffff")
          .setOrigin(0.5)
          .setStroke("#000000", 2);
      }
    };
    this.setActive = (state) => {
      //0 = in, 1 = active, 2 = out
      if (state === 0) {
        this.playerText.setColor("#ffffff");
      } else if (state === 1) {
        this.playerText.setColor("#00ff00");
      } else if (state === 2) {
        this.playerText.setColor("#ff0000");
      }
    };
    this.updateCoinBalance = (result) => {
      //result = true means they won the round, result = false means they withdrew and lose half money
      if (result) {
        this.coinBalance -= this.bidNumberValue;
        this.bidNumberValue = 0;
      } else {
        this.coinBalance -= Math.ceil(this.bidNumberValue / 2);
        this.bidNumberValue = 0;
      }
      if (scene.playerNumber === this.playerId) {
        scene.coinBalanceText.setText(this.coinBalance);
      }
    };
    this.renderHand = () => {
      this.houseDeck.forEach((card, index) => {
        scene.playerHand.add(card.handRender(index * 60 + 200, 720, 0.075));
      });
    };
    this.setCardsInteractive = (setting) => {
      this.houseDeck.forEach((card) => {
        if (setting) {
          scene.playerHand
            .getChildren()
            .forEach((child) => child.setInteractive());
        } else {
          scene.playerHand
            .getChildren()
            .forEach((child) => child.disableInteractive());
        }
      });
    };
    this.showFaceDown = () => {
      this.faceDownCard = scene.add
        .image(this.playX, this.playY, "houseBack")
        .setScale(0.15, 0.15);
    };
    this.flipCard = () => {
      this.faceDownCard.destroy();
      this.playedCard = scene.add
        .image(
          this.playX,
          this.playY,
          "house" + this.playedCardValue.toString()
        )
        .setScale(0.1, 0.1);
    };
    this.addMoney = (value) => {
      this.moneyValue += value;
      if (scene.playerNumber === this.playerId) {
        if (scene.moneyText) {
          scene.moneyText.setText("$" + this.moneyValue);
        } else {
          scene.moneyText = scene.add
            .text(850, 720, ["$" + this.moneyValue])
            .setColor("#00ff00")
            .setFontSize(30)
            .setFontFamily("Trebuchet MS")
            .setStroke("#000000", 6);
        }
      }
    };
    this.renderScore = () => {
      let score = this.coinBalance + this.moneyValue;
      this.playerScoreText = scene.add
        .text(this.playX, this.playY, ["$" + score])
        .setFontSize(40)
        .setFontFamily("Trebuchet MS")
        .setColor("#00ff00")
        .setOrigin(0.5);
      return score;
    };
    this.resetAllValues = () => {
      this.coinBalance = 18;
      this.bidNumberValue = 0;
      this.houseDeck = [];
      this.playedCardValue = null;
      this.moneyValue = 0;
      this.playerHand = [];
      this.playerScoreText.setVisible(false).destroy();
      this.playerScoreText = null;
    };
  }
}
