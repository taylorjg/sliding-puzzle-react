import { configure_ida_star } from "./ida-star"
import { randomElement, range, splitEvery, sum } from "./utils"

export type Position = [number, number]
export type Puzzle = number[][]

export const MOVE_UP = 1
export const MOVE_DOWN = 2
export const MOVE_LEFT = 3
export const MOVE_RIGHT = 4

export type Move = typeof MOVE_UP | typeof MOVE_DOWN | typeof MOVE_LEFT | typeof MOVE_RIGHT

export class Tile {
  position: Position
  value: number
  goalValue: number
  upTileIndex = -1
  downTileIndex = -1
  leftTileIndex = -1
  rightTileIndex = -1

  constructor(position: Position, value: number, goalValue: number) {
    this.position = position
    this.value = value
    this.goalValue = goalValue
  }

  static copyTile(tile: Tile): Tile {
    const newTile = new Tile(tile.position, tile.value, tile.goalValue)
    newTile.upTileIndex = tile.upTileIndex
    newTile.downTileIndex = tile.downTileIndex
    newTile.leftTileIndex = tile.leftTileIndex
    newTile.rightTileIndex = tile.rightTileIndex
    return newTile
  }

  getPossibleMoves(): Move[] {
    const moveDirections: Move[] = []
    if (this.upTileIndex >= 0) moveDirections.push(MOVE_UP)
    if (this.downTileIndex >= 0) moveDirections.push(MOVE_DOWN)
    if (this.leftTileIndex >= 0) moveDirections.push(MOVE_LEFT)
    if (this.rightTileIndex >= 0) moveDirections.push(MOVE_RIGHT)
    return moveDirections
  }
}

export const makeTiles = (puzzle: Puzzle): Tile[] => {
  const rows = puzzle.length
  const cols = puzzle[0].length

  const tiles: Tile[] = []

  for (const row of range(rows)) {
    for (const col of range(cols)) {
      const position: Position = [row, col]
      const value = puzzle[row][col]
      const maybeGoalValue = row * cols + col + 1
      const goalValue = maybeGoalValue < rows * cols ? maybeGoalValue : 0
      tiles.push(new Tile(position, value, goalValue))
    }
  }

  for (const tile of tiles) {
    const calculateTileIndexAtOffset = (rowOffset: number, colOffset: number): number => {
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

const copyTiles = (tiles: Tile[]): Tile[] => tiles.map(Tile.copyTile)

export class BoardManager {
  tiles: Tile[]

  constructor(tiles: Tile[]) {
    this.tiles = tiles
  }

  get blankTile(): Tile | undefined {
    return this.tiles.find(tile => tile.value === 0)
  }

  get isSolution(): boolean {
    return this.tiles.every(tile => tile.value === tile.goalValue)
  }

  getTotalManhattanDistance(): number {
    const manhattanDistances = this.tiles.map(tile => {
      const goalTileIndex = (tile.value === 0 ? this.tiles.length : tile.value) - 1
      const goalTile = this.tiles[goalTileIndex]
      return manhattanDistance(tile.position, goalTile.position)
    })
    return sum(manhattanDistances)
  }

  private getTileToSwapWith(move: Move, blankTile: Tile): Tile {
    switch (move) {
      case MOVE_UP: return this.tiles[blankTile.upTileIndex]
      case MOVE_DOWN: return this.tiles[blankTile.downTileIndex]
      case MOVE_LEFT: return this.tiles[blankTile.leftTileIndex]
      case MOVE_RIGHT: return this.tiles[blankTile.rightTileIndex]
      default: throw new Error(`unknown move ${move}`)
    }
  }

  makeMove(move: Move): void {
    const blankTile = this.blankTile
    if (!blankTile) throw new Error("No blank tile")
    const tileToSwapWith = this.getTileToSwapWith(move, blankTile)
    blankTile.value = tileToSwapWith.value
    tileToSwapWith.value = 0
  }
}

export class SlidingPuzzleNode {
  boardManager: BoardManager
  previousMove?: Move
  private _key?: string

  constructor(tiles: Tile[], previousMove?: Move) {
    this.boardManager = new BoardManager(tiles)
    this.previousMove = previousMove
  }

  get key(): string {
    if (!this._key) {
      this._key = this.boardManager.tiles.map(tile => tile.value).join("-")
    }
    return this._key
  }

  get isSolution(): boolean {
    return this.boardManager.isSolution
  }

  getPossibleMoves = (): Move[] => {
    const blankTile = this.boardManager.blankTile
    if (!blankTile) return []
    const possibleMoves = blankTile.getPossibleMoves()
    if (this.previousMove) {
      const reverseMove = getReverseMove(this.previousMove)
      return possibleMoves.filter(move => move !== reverseMove)
    }
    return possibleMoves
  }

  getCost(): number {
    return this.boardManager.getTotalManhattanDistance()
  }
}

const getReverseMove = (move: Move): Move => {
  switch (move) {
    case MOVE_UP: return MOVE_DOWN
    case MOVE_DOWN: return MOVE_UP
    case MOVE_LEFT: return MOVE_RIGHT
    case MOVE_RIGHT: return MOVE_LEFT
    default: throw new Error(`unknown move ${move}`)
  }
}

const manhattanDistance = (position1: Position, position2: Position): number => {
  const [row1, col1] = position1
  const [row2, col2] = position2
  return Math.abs(row1 - row2) + Math.abs(col1 - col2)
}

export const getChildOfNodeAndMove = (node: SlidingPuzzleNode, move: Move): SlidingPuzzleNode => {
  const newTiles = copyTiles(node.boardManager.tiles)
  const childNode = new SlidingPuzzleNode(newTiles, move)
  childNode.boardManager.makeMove(move)
  return childNode
}

export const puzzleFromNode = (node: SlidingPuzzleNode, numCols: number): Puzzle => {
  const values = node.boardManager.tiles.map(tile => tile.value)
  return Array.from(splitEvery(values, numCols))
}

export const scrambleSolvedPuzzle = (solvedPuzzle: Puzzle): Puzzle => {
  const NUM_MOVES = 50
  const tiles = makeTiles(solvedPuzzle)
  let node = new SlidingPuzzleNode(tiles)
  range(NUM_MOVES).forEach(() => {
    const possibleMoves = node.getPossibleMoves()
    const move = randomElement(possibleMoves)
    node = getChildOfNodeAndMove(node, move)
  })
  const numCols = solvedPuzzle[0].length
  return puzzleFromNode(node, numCols)
}

export const solve = async (
  node: SlidingPuzzleNode,
  checkForCancellation?: () => Promise<boolean>
): Promise<SlidingPuzzleNode[] | undefined> => {
  const h = (n: SlidingPuzzleNode) => n.getCost()
  const isGoal = (n: SlidingPuzzleNode) => n.isSolution
  const isNodeInPath = () => false
  const successors = (n: SlidingPuzzleNode) => {
    const possibleMoves = n.getPossibleMoves()
    return possibleMoves.map(move => getChildOfNodeAndMove(n, move))
  }
  const stepCost = () => 1

  const ida_star = configure_ida_star(h, isGoal, isNodeInPath, successors, stepCost, checkForCancellation)
  const result = await ida_star(node)
  return result?.path
}
