import { configure_ida_star } from './ida_star'
import { randomElement, range, splitEvery, sum } from './utils'

export class Tile {

  constructor(position, value, goalValue) {
    this.position = position
    this.value = value
    this.goalValue = goalValue
    this.upTileIndex = -1
    this.downTileIndex = -1
    this.leftTileIndex = -1
    this.rightTileIndex = -1
  }

  static copyTile(tile) {
    const newTile = new Tile(tile.position, tile.value, tile.goalValue)
    newTile.upTileIndex = tile.upTileIndex
    newTile.downTileIndex = tile.downTileIndex
    newTile.leftTileIndex = tile.leftTileIndex
    newTile.rightTileIndex = tile.rightTileIndex
    return newTile
  }

  getPossibleMoves() {
    const moveDirections = []
    if (this.upTileIndex >= 0) moveDirections.push(MOVE_UP)
    if (this.downTileIndex >= 0) moveDirections.push(MOVE_DOWN)
    if (this.leftTileIndex >= 0) moveDirections.push(MOVE_LEFT)
    if (this.rightTileIndex >= 0) moveDirections.push(MOVE_RIGHT)
    return moveDirections
  }
}

export const makeTiles = puzzle => {

  const rows = puzzle.length
  const cols = puzzle[0].length

  const tiles = []

  for (const row of range(rows)) {
    for (const col of range(cols)) {
      const position = [row, col]
      const value = puzzle[row][col]
      const maybeGoalValue = row * cols + col + 1
      const goalValue = maybeGoalValue < rows * cols ? maybeGoalValue : 0
      const tile = new Tile(position, value, goalValue)
      tiles.push(tile)
    }
  }

  for (const tile of tiles) {

    const calculateTileIndexAtOffset = (rowOffset, colOffset) => {
      const row = tile.position[0] + rowOffset
      const col = tile.position[1] + colOffset
      return row >= 0 && row < rows && col >= 0 && col < cols ? row * cols + col : -1
    }

    tile.upTileIndex = calculateTileIndexAtOffset(-1, 0)
    tile.downTileIndex = calculateTileIndexAtOffset(1, 0)
    tile.leftTileIndex = calculateTileIndexAtOffset(0, -1)
    tile.rightTileIndex = calculateTileIndexAtOffset(0, 1)
  }

  return tiles
}

const copyTiles = tiles => tiles.map(Tile.copyTile)

export class MyNode {

  constructor(tiles, previousMove) {
    this.boardManager = new BoardManager(tiles)
    this.previousMove = previousMove
    this._key = undefined
  }

  get key() {
    if (!this._key) {
      this._key = this.boardManager.tiles.map(tile => tile.value).join('-')
    }
    return this._key
  }

  get isSolution() {
    return this.boardManager.isSolution
  }

  getPossibleMoves = () => {
    const possibleMoves = this.boardManager.blankTile.getPossibleMoves()
    if (this.previousMove) {
      const reverseMove = getReverseMove(this.previousMove)
      return possibleMoves.filter(move => move !== reverseMove)
    }
    return possibleMoves
  }

  getCost() {
    return this.boardManager.getTotalManhattanDistance()
  }
}

const MOVE_UP = 1
const MOVE_DOWN = 2
const MOVE_LEFT = 3
const MOVE_RIGHT = 4

const getReverseMove = move => {
  switch (move) {
    case MOVE_UP: return MOVE_DOWN
    case MOVE_DOWN: return MOVE_UP
    case MOVE_LEFT: return MOVE_RIGHT
    case MOVE_RIGHT: return MOVE_LEFT
    default: throw new Error(`unknown move ${move}`)
  }
}

class BoardManager {

  constructor(tiles) {
    this.tiles = tiles
  }

  get blankTile() {
    return this.tiles.find(tile => tile.value === 0)
  }

  get isSolution() {
    return this.tiles.every(tile => tile.value === tile.goalValue)
  }

  getTotalManhattanDistance() {
    const manhattanDistances = this.tiles.map(tile => {
      const goalTileIndex = (tile.value === 0 ? this.tiles.length : tile.value) - 1
      const goalTile = this.tiles[goalTileIndex]
      return manhattanDistance(tile.position, goalTile.position)
    })
    return sum(manhattanDistances)
  }

  _getTileToSwapWith(move, blankTile) {
    switch (move) {
      case MOVE_UP: return this.tiles[blankTile.upTileIndex]
      case MOVE_DOWN: return this.tiles[blankTile.downTileIndex]
      case MOVE_LEFT: return this.tiles[blankTile.leftTileIndex]
      case MOVE_RIGHT: return this.tiles[blankTile.rightTileIndex]
      default: throw new Error(`unknown move ${move}`)
    }
  }

  makeMove(move) {
    const blankTile = this.blankTile
    const tileToSwapWith = this._getTileToSwapWith(move, blankTile)
    blankTile.value = tileToSwapWith.value
    tileToSwapWith.value = 0
  }
}

const manhattanDistance = (position1, position2) => {
  const [row1, col1] = position1
  const [row2, col2] = position2
  return Math.abs(row1 - row2) + Math.abs(col1 - col2)
}

const getChildOfNodeAndMove = (node, move) => {
  const newTiles = copyTiles(node.boardManager.tiles)
  const childNode = new MyNode(newTiles, move)
  childNode.boardManager.makeMove(move)
  return childNode
}

export const scrambleSolvedPuzzle = solvedPuzzle => {
  const NUM_MOVES = 50
  const tiles = makeTiles(solvedPuzzle)
  let node = new MyNode(tiles)
  for (const _ of range(NUM_MOVES)) {
    const possibleMoves = node.getPossibleMoves()
    const move = randomElement(possibleMoves)
    node = getChildOfNodeAndMove(node, move)
  }
  const numCols = solvedPuzzle[0].length
  const values = node.boardManager.tiles.map(tile => tile.value)
  return Array.from(splitEvery(values, numCols))
}

export const solve = node => {

  const h = node => node.getCost()
  const isGoal = node => node.isSolution
  const isNodeInPath = (_node, _path) => false
  const successors = node => {
    const possibleMoves = node.getPossibleMoves()
    return possibleMoves.map(move => getChildOfNodeAndMove(node, move))
  }
  const stepCost = (_node, _succ) => 1

  const ida_star = configure_ida_star(h, isGoal, isNodeInPath, successors, stepCost)
  const result = ida_star(node)
  return result?.path
}
