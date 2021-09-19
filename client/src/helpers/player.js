export default class Player {
  constructor(scene) {
    this.playerId;
    this.playerName;
    this.x;
    this.y;
    this.coinBalance = 12;
    this.playerText;
    this.bidNumberText;
    this.bidNumberValue = 0;
    this.houseDeck = [];
    this.faceDownCard;
    this.playedCard;
    this.playedCardValue;
    this.moneyValue = 0;
    this.playerHand = [];

    this.setValues = (id, x, y) => {
      this.playerId = id;
      this.x = x;
      this.y = y;
    };
    this.render = (name) => {
      this.playerText = scene.add.text(this.x, this.y, [name]);
      this.playerName = name;
    };

    this.setBidNumber = (bid) => {
      if (this.bidNumberText) {
        this.bidNumberValue = bid;
        this.bidNumberText.setText(bid);
      } else {
        this.bidNumberValue = bid;
        this.bidNumberText = scene.add
          .text(this.x - 60, this.y - 60, [bid])
          .setFontSize(30)
          .setColor("#00ff00");
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
        .image(this.x, this.y + 100, "houseBack")
        .setScale(0.15, 0.15);
    };
    this.flipCard = () => {
      this.faceDownCard.destroy();
      this.playedCard = scene.add
        .image(this.x, this.y + 100, "house" + this.playedCardValue.toString())
        .setScale(0.15, 0.15);
    };
    this.renderScore = () => {
      let score = this.coinBalance + this.moneyValue;
      let playerScore = scene.add
        .text(this.x, this.y - 40, ["$" + score])
        .setFontSize(40)
        .setFontFamily("Trebuchet MS")
        .setColor("#00ff00");
      return score;
    };
  }
}
