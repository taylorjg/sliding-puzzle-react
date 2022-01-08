import * as Logic from "../logic"

const extractMoves = (path: Logic.SlidingPuzzleNode[]): number[] => {
  return path.slice(1).map(node => node.previousMove)
}

export const solve = (puzzle: number[][]): number[] | undefined => {
  console.log('[solve]', 'puzzle:', puzzle)
  const tiles = Logic.makeTiles(puzzle)
  console.log('[solve]', 'tiles:', tiles)
  const root = new Logic.SlidingPuzzleNode(tiles)
  console.log('[solve]', 'root:', root)
  const path = Logic.solve(root)
  console.log('[solve]', 'path:', path)
  if (!path) return undefined
  const solution = extractMoves(path)
  console.log('[solve]', 'solution:', solution)
  return solution
}
