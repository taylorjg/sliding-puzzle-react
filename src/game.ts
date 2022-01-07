import * as Phaser from "phaser"
import { makeTiles } from "./logic/logic"
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

class BoardScene extends Phaser.Scene {

  tiles: Phaser.GameObjects.Container[] = []

  public constructor() {
    super("BoardScene")
  }

  public create() {
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
    const { width, height } = this.sys.game.canvas
    const tileWidth = (width - (GUTTER * 2)) / numCols
    const tileHeight = (height - (GUTTER * 2)) / numRows

    const tileRefs = makeTiles(puzzle)

    for (const row of range(numRows)) {
      for (const col of range(numCols)) {
        const value = puzzle[row][col]
        if (value === 0) continue
        const x = GUTTER + col * tileWidth + tileWidth / 2
        const y = GUTTER + row * tileHeight + tileHeight / 2

        const goalValueTileRef = tileRefs.find(tileRef => tileRef.goalValue === value)
        const [goalValueRow, goalValueCol] = goalValueTileRef?.position
        const colour = (goalValueRow + goalValueCol) % 2
          ? 0xFAEBD7 // AntiqueWhite
          : 0xB22222 // Firebrick
        const rectangle = this.add.rectangle(0, 0, tileWidth, tileHeight, colour)
        rectangle.setScale(0.98)

        const textStyle = {
          fontSize: numRows === 4 ? "48px" : "64px",
          color: "#FFD700" // Gold
        }
        const text = this.add.text(0, 0, value.toString(), textStyle).setOrigin(0.5)

        const tile = this.add.container(x, y, [rectangle, text])
        this.add.existing(tile)
        tile.setSize(tileWidth, tileHeight)
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
  scene: [BoardScene],
  parent: "puzzle"
}

export const initGame = () => {
  return new Phaser.Game(gameConfig)
}
