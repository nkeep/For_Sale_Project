export default class HouseCard {
  constructor(scene) {
    self = this;
    this.value = 0;
    this.sprite;
    self.card;
    this.setValues = (value, sprite) => {
      this.value = value;
      this.sprite = sprite;
    };
    this.render = (x, y, size) => {
      this.card = scene.add.image(x, y, this.sprite).setScale(size, size);
      this.card.setDataEnabled();
      this.card.setData({ value: this.value });
      return this.card;
    };
    this.handRender = (x, y, size) => {
      let card = scene.add
        .image(x, y, this.sprite)
        .setScale(size, size)
        .setInteractive()
        .setDataEnabled()
        .setData({ value: this.value })
        .on("pointerover", function (pointer) {
          if (card !== scene.selectedCard) {
            card.setTint(0xcc69b4);
          }
        })
        .on("pointerout", function (pointer) {
          if (card !== scene.selectedCard) {
            card.setTint();
          }
        })
        .on("pointerdown", function (pointer) {
          if (scene.selectedCard) {
            scene.selectedCard.setTint().setInteractive();
          }
          scene.selectedCard = card;
          card.setTint(0xff69b4);
        });
      scene.input.setDraggable(card);

      // this.card.on("pointerover", function (pointer) {
      //   console.log(self.card.data.values.value);
      //   self.card.setTint(0xcc69b4);
      // });
      // this.card.on("pointerout", function (pointer) {
      //   self.card.setTint();
      // });
      // this.card.on("pointerdown", function (pointer) {
      //   console.log(self.card);
      //   //scene.selectedCard.setTint();
      //   scene.selectedCard = self.card;
      //   self.card.setTint(0xff69b4);
      // });
      return card;
    };
  }
}
