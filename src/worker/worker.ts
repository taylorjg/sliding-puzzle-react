// Unexpected use of 'self'.
/* eslint-disable no-restricted-globals */

import * as Logic from "../logic"

// 'worker.ts' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module.ts(1208)
export { }

const extractMoves = (path: Logic.SlidingPuzzleNode[]): number[] => {
  return path.slice(1).map(node => node.previousMove)
}

self.onmessage = ({ data: { puzzle } }) => {
  const tiles = Logic.makeTiles(puzzle)
  const root = new Logic.SlidingPuzzleNode(tiles)
  const path = Logic.solve(root)
  const solution = path ? extractMoves(path) : undefined
  self.postMessage({ solution })
}
