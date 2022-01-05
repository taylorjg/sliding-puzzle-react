import * as Phaser from "phaser"

// This value could be anything really. The key point is that we use the same
// value for both width and height. We are assuming that the #puzzle div is a
// square as a result of the CSS applied to it.
const SIZE = 400

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    width: SIZE,
    height: SIZE,
    mode: Phaser.Scale.FIT
  },
  backgroundColor: "#000000",
  scene: [],
  parent: "puzzle",
  dom: {
    createContainer: true
  }
}

export const initGame = () => {
  return new Phaser.Game(gameConfig)
}
