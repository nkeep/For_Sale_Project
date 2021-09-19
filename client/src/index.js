import Phaser from "phaser";
import Game from "./scenes/game";
import Home from "./scenes/home";

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1280,
  height: 780,
  scene: [Home, Game],
  dom: { createContainer: true },
};

const game = new Phaser.Game(config);
