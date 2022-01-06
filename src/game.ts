import * as Phaser from "phaser"

// This value could be anything really. The key point is that we use the same
// value for both width and height. We are assuming that the #puzzle div is a
// square as a result of the CSS applied to it.
const SIZE = 400

class GameScene extends Phaser.Scene {

  public constructor() {
    console.log("[GameScene#constructor]")
    super("GameScene")
  }

  public create() {
    console.log("[GameScene#create]")
    this.game.events.on("ENTER_READONLY_MODE", this.onEnterReadonlyMode, this)
    this.game.events.on("RESET_BOARD", this.onResetBoard, this)
    this.game.events.on("START_SOLUTION_PRESENTATION", this.onStartSolutionPresentation, this)
    this.game.events.on("CANCEL_SOLUTION_PRESENTATION", this.onCancelSolutionPresentation, this)

    const tile = this.add.rectangle(100, 100, 100, 100, 0xFFFF00)
    tile.setInteractive({ useHandCursor: true })
    tile.on(Phaser.Input.Events.POINTER_DOWN, this.onTileClick, this)
    this.add.existing(tile)
  }

  private onTileClick() {
    this.game.events.emit("MOVE")
  }

  private onEnterReadonlyMode() {
  }

  private onResetBoard(puzzle: number[]) {
    console.dir(puzzle)
  }

  private onStartSolutionPresentation(solution: number[]) {
    console.dir(solution)
  }

  private onCancelSolutionPresentation() {
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    width: SIZE,
    height: SIZE,
    mode: Phaser.Scale.FIT
  },
  backgroundColor: "#000000",
  scene: [GameScene],
  parent: "puzzle"
}

export const initGame = () => {
  return new Phaser.Game(gameConfig)
}
