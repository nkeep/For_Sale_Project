export default class MoneyCard {
  constructor(scene) {
    this.value = 0;
    this.sprite;
    this.card;
    this.setValues = (value, sprite) => {
      this.value = value;
      this.sprite = sprite;
    };
    this.render = (x, y) => {
      this.card = scene.add.image(x, y, this.sprite).setScale(0.15, 0.15);
      return this.card;
    };
  }
}
