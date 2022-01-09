import * as Logic from "../logic"

const extractMoves = (path: Logic.SlidingPuzzleNode[]): number[] => {
  return path.slice(1).map(node => node.previousMove)
}

export const solve = async (puzzle: number[][]): Promise<number[] | undefined> => {
  const tiles = Logic.makeTiles(puzzle)
  const root = new Logic.SlidingPuzzleNode(tiles)
  const path = Logic.solve(root)
  return path ? extractMoves(path) : undefined
}
