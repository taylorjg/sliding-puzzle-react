import * as Phaser from "phaser"
import * as Logic from "./logic"
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

const GUTTER = 10

class BoardScene extends Phaser.Scene {

  numRows = 0
  numCols = 0
  tileWidth = 0
  tileHeight = 0
  tiles: Phaser.GameObjects.Container[] = []
  node?: Logic.MyNode

  public constructor() {
    super("BoardScene")
  }

  public create() {
    this.game.events.on("ENTER_READONLY_MODE", this.onEnterReadonlyMode, this)
    this.game.events.on("RESET_BOARD", this.onResetBoard, this)
    this.game.events.on("START_SOLUTION_PRESENTATION", this.onStartSolutionPresentation, this)
    this.game.events.on("CANCEL_SOLUTION_PRESENTATION", this.onCancelSolutionPresentation, this)
  }

  private determineMove(blankTileRef: Logic.Tile, clickedRow: number, clickedCol: number) {

    const possibleMoves = [
      { index: blankTileRef.upTileIndex, move: Logic.MOVE_UP },
      { index: blankTileRef.downTileIndex, move: Logic.MOVE_DOWN },
      { index: blankTileRef.leftTileIndex, move: Logic.MOVE_LEFT },
      { index: blankTileRef.rightTileIndex, move: Logic.MOVE_RIGHT }
    ]

    for (const { index, move } of possibleMoves) {
      if (index >= 0) {
        const tile = this.node?.boardManager.tiles[index]
        const [row, col] = tile.position
        if (row === clickedRow && col === clickedCol) {
          return move
        }
      }
    }
  }

  private handleTileClick(tile: Phaser.GameObjects.Container) {
    if (this.node?.isSolution) return
    const [clickedRow, clickedCol] = tile.getData(["row", "col"])
    const blankTileRef = this.node?.boardManager.blankTile
    const move = this.determineMove(blankTileRef, clickedRow, clickedCol)
    if (move) {
      const [newRow, newCol] = blankTileRef.position
      const x = GUTTER + newCol * this.tileWidth + this.tileWidth / 2
      const y = GUTTER + newRow * this.tileHeight + this.tileHeight / 2
      this.tweens.add({
        targets: tile,
        duration: 250,
        ease: 'Sine.InOut',
        x,
        y,
        onStart: () => {
        },
        onComplete: () => {
          tile.setData({ row: newRow, col: newCol })
          this.node = Logic.getChildOfNodeAndMove(this.node, move)
          this.game.events.emit("TILE_MOVED")
        }
      })
    }
  }

  private onEnterReadonlyMode() {
  }

  private onResetBoard(puzzle: number[][]) {
    this.createTiles(puzzle)
  }

  private onStartSolutionPresentation(solution: number[]) {
  }

  private onCancelSolutionPresentation() {
  }

  private createTiles(puzzle: number[][]) {

    for (const tile of this.tiles) {
      tile.destroy(true)
    }

    this.numRows = puzzle.length
    this.numCols = puzzle[0].length

    const { width, height } = this.sys.game.canvas
    this.tileWidth = (width - (GUTTER * 2)) / this.numCols
    this.tileHeight = (height - (GUTTER * 2)) / this.numRows

    const tileRefs = Logic.makeTiles(puzzle)
    this.node = new Logic.MyNode(tileRefs)

    for (const row of range(this.numRows)) {
      for (const col of range(this.numCols)) {
        const value = puzzle[row][col]
        if (value === 0) continue
        const x = GUTTER + col * this.tileWidth + this.tileWidth / 2
        const y = GUTTER + row * this.tileHeight + this.tileHeight / 2

        const goalValueTileRef = tileRefs.find(tileRef => tileRef.goalValue === value)
        const [goalValueRow, goalValueCol] = goalValueTileRef?.position
        const colour = (goalValueRow + goalValueCol) % 2
          ? 0xFAEBD7 // AntiqueWhite
          : 0xB22222 // Firebrick
        const rectangle = this.add.rectangle(0, 0, this.tileWidth, this.tileHeight, colour)
        rectangle.setScale(0.98)

        const textStyle = {
          fontSize: this.numRows === 4 ? "48px" : "64px",
          color: "#FFD700" // Gold
        }
        const text = this.add.text(0, 0, value.toString(), textStyle).setOrigin(0.5)

        const tile = this.add.container(x, y, [rectangle, text])
        this.add.existing(tile)
        tile.setData({ row, col })
        tile.setSize(this.tileWidth, this.tileHeight)
        tile.setInteractive({ useHandCursor: true })
        tile.on(Phaser.Input.Events.POINTER_DOWN, () => this.handleTileClick(tile))
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
