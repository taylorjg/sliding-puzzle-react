import * as Phaser from "phaser"
import * as Logic from "./logic"
import { range } from "./logic/utils"

enum BoardActionNames {
  ShowOverlay = "ShowOverlay",
  HideOverlay = "HideOverlay",
  ResetBoard = "ResetBoard",
  StartSolutionPresentation = "StartSolutionPresentation",
  CancelSolutionPresentation = "CancelSolutionPresentation"
}

export enum BoardEventNames {
  GameInitialised = "GameInitialised",
  TileMoved = "TileMoved",
  FinishedPresentingSolution = "FinishedPresentingSolution"
}

export interface PuzzleActions {
  showOverlay: () => void
  hideOverlay: () => void
  resetBoard: (puzzle: number[][]) => void
  startSolutionPresentation: (solution: number[]) => void
  cancelSolutionPresentation: () => void
}

export const makePuzzleActions = (game: Phaser.Game): PuzzleActions => {
  return {
    showOverlay: () => game.events.emit(BoardActionNames.ShowOverlay),
    hideOverlay: () => game.events.emit(BoardActionNames.HideOverlay),
    resetBoard: (puzzle: number[][]) => game.events.emit(BoardActionNames.ResetBoard, puzzle),
    startSolutionPresentation: (solution: number[]) => game.events.emit(BoardActionNames.StartSolutionPresentation, solution),
    cancelSolutionPresentation: () => game.events.emit(BoardActionNames.CancelSolutionPresentation)
  }
}

const colourNumberToString = (colourNumber: number): string => `#${colourNumber.toString(16)}`

const ANTIQUE_WHITE = 0xFAEBD7
const FIREBRICK = 0xB22222
const GOLD = 0xFFD700
const BLACK = 0x000000

const GUTTER = 10

class BoardScene extends Phaser.Scene {

  numRows = 0
  numCols = 0
  tileWidth = 0
  tileHeight = 0
  tiles: Phaser.GameObjects.Container[] = []
  overlay?: Phaser.GameObjects.Rectangle
  rotatingTile?: Phaser.GameObjects.Container
  timerEvent?: Phaser.Time.TimerEvent
  node?: Logic.SlidingPuzzleNode
  solution?: number[]

  public constructor() {
    super("BoardScene")
  }

  public create() {
    this.game.events.on(BoardActionNames.ShowOverlay, this.onShowOverlay, this)
    this.game.events.on(BoardActionNames.HideOverlay, this.onHideOverlay, this)
    this.game.events.on(BoardActionNames.ResetBoard, this.onResetBoard, this)
    this.game.events.on(BoardActionNames.StartSolutionPresentation, this.onStartSolutionPresentation, this)
    this.game.events.on(BoardActionNames.CancelSolutionPresentation, this.onCancelSolutionPresentation, this)

    this.game.events.emit(BoardEventNames.GameInitialised)
  }

  private determineMoveToMake(blankTileRef: Logic.Tile, clickedRow: number, clickedCol: number) {

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
    if (this.tweens.getAllTweens().length > 0) return
    const [clickedRow, clickedCol] = tile.getData(["row", "col"])
    const blankTileRef = this.node?.boardManager.blankTile
    const move = this.determineMoveToMake(blankTileRef, clickedRow, clickedCol)
    if (move) {
      this.moveTile(tile, blankTileRef, move)
    }
  }

  private onShowOverlay() {

    const { width, height } = this.sys.game.canvas

    this.overlay = this.add.rectangle(0, 0, width, height, BLACK, 0.6)
      .setOrigin(0, 0)
      .setDepth(1)
    this.add.existing(this.overlay)

    this.timerEvent = this.time.delayedCall(500, () => {
      const cx = width / 2
      const cy = height / 2
      const biggerTileWidth = this.tileWidth * 1.2
      const biggerTileHeight = this.tileHeight * 1.2
      const tileBackground = this.add.rectangle(0, 0, biggerTileWidth, biggerTileHeight, BLACK)
      const tileFace = this.add.rectangle(0, 0, biggerTileWidth, biggerTileHeight, FIREBRICK).setScale(0.98)
      const textStyle = {
        fontSize: this.numRows === 4 ? "48px" : "64px",
        color: colourNumberToString(GOLD)
      }
      const values = range(this.numRows * this.numCols).slice(1)
      const text = this.add.text(0, 0, values[0].toString(), textStyle).setOrigin(0.5)
      text.setData("valueIndex", 0)
      this.rotatingTile = this.add.container(cx, cy, [tileBackground, tileFace, text]).setDepth(2)
      this.add.existing(this.rotatingTile)
      this.tweens.add({
        targets: this.rotatingTile,
        duration: 1000,
        ease: "Sine.InOut",
        angle: 180,
        scale: 0,
        hold: 200,
        yoyo: true,
        loop: -1,
        loopDelay: 400,
        onLoop: () => {
          const valueIndex = text.getData("valueIndex")
          const nextValueIndex = (valueIndex + 1) % values.length
          const value = values[nextValueIndex]
          text.setText(value.toString())
          text.setData("valueIndex", nextValueIndex)
          const row = Math.floor(nextValueIndex / this.numCols)
          const col = nextValueIndex % this.numCols
          tileFace.fillColor = (row + col) % 2 ? ANTIQUE_WHITE : FIREBRICK
        }
      })
    }, undefined, this)
  }

  private onHideOverlay() {
    if (this.timerEvent) {
      this.timerEvent.destroy()
      this.timerEvent = undefined
    }
    if (this.overlay) {
      this.overlay.destroy(true)
    }
    if (this.rotatingTile) {
      this.tweens.killTweensOf(this.rotatingTile)
      this.rotatingTile.destroy(true)
    }
  }

  private onResetBoard(puzzle: number[][]) {
    this.createTiles(puzzle)
    this.solution = undefined
  }

  private onStartSolutionPresentation(solution: number[]) {
    this.solution = solution
    this.presentNextSolutionMove()
  }

  private determineTileToMove = (blankTileRef: Logic.Tile, move: number) => {

    const moveOffsets = new Map([
      [Logic.MOVE_UP, [-1, 0]],
      [Logic.MOVE_DOWN, [1, 0]],
      [Logic.MOVE_LEFT, [0, -1]],
      [Logic.MOVE_RIGHT, [0, 1]]
    ])

    const moveOffset = moveOffsets.get(move)
    if (moveOffset) {
      const [blankRow, blankCol] = blankTileRef.position
      const [rowOffset, colOffset] = moveOffset
      const targetRow = blankRow + rowOffset
      const targetCol = blankCol + colOffset
      return this.tiles.find(tile => {
        const [row, col] = tile.getData(["row", "col"])
        return row === targetRow && col === targetCol
      })
    }
    return undefined
  }

  private presentNextSolutionMove() {
    const move = this.solution?.shift()
    if (move) {
      const blankTileRef = this.node?.boardManager.blankTile
      const tile = this.determineTileToMove(blankTileRef, move)
      if (tile) {
        this.moveTile(tile, blankTileRef, move, () => this.presentNextSolutionMove())
      }
    } else {
      this.game.events.emit(BoardEventNames.FinishedPresentingSolution)
    }
  }

  private moveTile(
    tile: Phaser.GameObjects.Container,
    blankTileRef: Logic.Tile,
    move: number,
    cb?: () => void
  ) {
    const [row, col] = blankTileRef.position
    const x = GUTTER + col * this.tileWidth + this.tileWidth / 2
    const y = GUTTER + row * this.tileHeight + this.tileHeight / 2
    this.tweens.add({
      targets: tile,
      duration: 250,
      ease: "Sine.InOut",
      x,
      y,
      onComplete: () => {
        tile.setData({ row, col })
        this.node = Logic.getChildOfNodeAndMove(this.node, move)
        this.game.events.emit(BoardEventNames.TileMoved, this.node)
        cb?.()
      }
    })
  }

  private onCancelSolutionPresentation() {
    this.solution = undefined
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
    this.node = new Logic.SlidingPuzzleNode(tileRefs)

    for (const row of range(this.numRows)) {
      for (const col of range(this.numCols)) {
        const value = puzzle[row][col]
        if (value === 0) continue
        const x = GUTTER + col * this.tileWidth + this.tileWidth / 2
        const y = GUTTER + row * this.tileHeight + this.tileHeight / 2

        const goalValueTileRef = tileRefs.find(tileRef => tileRef.goalValue === value)
        const [goalValueRow, goalValueCol] = goalValueTileRef?.position
        const colour = (goalValueRow + goalValueCol) % 2 ? ANTIQUE_WHITE : FIREBRICK
        const rectangle = this.add.rectangle(0, 0, this.tileWidth, this.tileHeight, colour)
        rectangle.setScale(0.98)

        const textStyle = {
          fontSize: this.numRows === 4 ? "48px" : "64px",
          color: colourNumberToString(GOLD)
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
