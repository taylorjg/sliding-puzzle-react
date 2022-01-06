import * as Phaser from "phaser"
// import { makeTiles } from "./logic/logic"
import { range } from "./logic/utils"

export interface PuzzleActions {
  enterReadonlyMode: () => void
  resetBoard: (puzzle: Number[][]) => void
  startSolutionPresentation: (solution: Number[]) => void
  cancelSolutionPresentation: () => void
}

export const makePuzzleActions = (game: Phaser.Game): PuzzleActions => {
  return {
    enterReadonlyMode: () => game.events.emit("ENTER_READONLY_MODE"),
    resetBoard: (puzzle: Number[][]) => game.events.emit("RESET_BOARD", puzzle),
    startSolutionPresentation: (solution: Number[]) => game.events.emit("START_SOLUTION_PRESENTATION", solution),
    cancelSolutionPresentation: () => game.events.emit("CANCEL_SOLUTION_PRESENTATION")
  }
}

class GameScene extends Phaser.Scene {

  tiles: Phaser.GameObjects.Container[] = []

  public constructor() {
    super("GameScene")
  }

  public create() {
    console.log("[GameScene#create]")
    this.game.events.on("ENTER_READONLY_MODE", this.onEnterReadonlyMode, this)
    this.game.events.on("RESET_BOARD", this.onResetBoard, this)
    this.game.events.on("START_SOLUTION_PRESENTATION", this.onStartSolutionPresentation, this)
    this.game.events.on("CANCEL_SOLUTION_PRESENTATION", this.onCancelSolutionPresentation, this)
  }

  private onTileClick() {
    this.game.events.emit("TILE_MOVED")
  }

  private onEnterReadonlyMode() {
  }

  private onResetBoard(puzzle: number[][]) {
    this.createTiles(puzzle)
  }

  private onStartSolutionPresentation(solution: number[]) {
    console.dir(solution)
  }

  private onCancelSolutionPresentation() {
  }

  private createTiles(puzzle: number[][]) {

    for (const tile of this.tiles) {
      tile.destroy(true)
    }

    const numRows = puzzle.length
    const numCols = puzzle[0].length

    const GUTTER = 10
    const { width } = this.sys.game.canvas
    const tileSize = (width - (GUTTER * 2)) / numCols
    for (const row of range(numRows)) {
      for (const col of range(numCols)) {
        const value = puzzle[row][col]
        if (value === 0) continue
        const x = GUTTER + row * tileSize + tileSize / 2
        const y = GUTTER + col * tileSize + tileSize / 2
        const rectangle = this.add.rectangle(0, 0, tileSize, tileSize, 0xFFFF)
        rectangle.setScale(0.98)
        const text = this.add.text(0, 0, value.toString(), { fontSize: "48px" }).setOrigin(0.5)
        const tile = this.add.container(x, y, [rectangle, text])
        this.add.existing(tile)
        tile.setSize(tileSize, tileSize)
        tile.setInteractive({ useHandCursor: true })
        tile.on(Phaser.Input.Events.POINTER_DOWN, this.onTileClick, this)
        this.tiles.push(tile)
      }
    }
  }
}

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
  scene: [GameScene],
  parent: "puzzle"
}

export const initGame = () => {
  return new Phaser.Game(gameConfig)
}
