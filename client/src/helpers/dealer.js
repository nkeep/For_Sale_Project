export default class Dealer {
  constructor(scene) {
    this.houseCardsInPlay = 0;
    this.moneyCardsInPlay = 0;
    this.dealCards = (scale) => {
      //   let playerSprite;
      //   let opponentSprite;
      //   if (scene.isPlayerA) {
      //     playerSprite = "money15";
      //     opponentSprite = "house30";
      //   } else {
      //     playerSprite = "house30";
      //     opponentSprite = "money15";
      //   }
      //   for (let i = 0; i < 5; i++) {
      //     let playerCard = new HouseCard(scene);
      //     playerCard.render(475 + i * 100, 650, playerSprite);

      //     let opponentCard = new Card(scene);
      //     scene.opponentCards.push(
      //       opponentCard
      //         .render(475 + i * 100, 125, opponentSprite)
      //         .disableInteractive()
      //     );
      //   }
      for (let i = 0; i < scene.activePlayers; i++) {
        // let sprite = scene.load.image("housecards", 3);
        scene.houseCards[i].render(
          640 - 250 + this.houseCardsInPlay * 150,
          375,
          scale
        );
        this.houseCardsInPlay++;
      }
    };
    this.dealMoneyCards = () => {
      for (let i = 0; i < scene.activePlayers; i++) {
        scene.moneyCards[i].render(
          640 - 250 + this.moneyCardsInPlay * 150,
          375
        );
        this.moneyCardsInPlay++;
      }
    };
  }
}
