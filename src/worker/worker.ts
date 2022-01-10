// Unexpected use of 'self'.
/* eslint-disable no-restricted-globals */

import * as Logic from "../logic"

// 'worker.ts' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module.ts(1208)
export { }

let cancelled = false
let iterationCount = 0

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const checkForCancellation = async (): Promise<boolean> => {
  iterationCount++
  if (iterationCount % 10000 === 0) {
    await delay(0)
    return cancelled
  } else {
    return false
  }
}

const extractMoves = (path: Logic.SlidingPuzzleNode[]): number[] => {
  return path.slice(1).map(node => node.previousMove)
}

const onSolve = async (puzzle: number[][]) => {
  console.log('[worker onSolve]')
  cancelled = false
  iterationCount = 0
  const tiles = Logic.makeTiles(puzzle)
  const root = new Logic.SlidingPuzzleNode(tiles)
  const path = await Logic.solve(root, checkForCancellation)
  const solution = path ? extractMoves(path) : undefined
  console.log('[worker onSolve]', 'iterationCount:', iterationCount)
  self.postMessage(solution)
}

const onCancel = () => {
  console.log('[worker onCancel]')
  cancelled = true
}

type SolveMessage = {
  type: "solve"
  puzzle: number[][]
}

type CancelMessage = {
  type: "cancel"
}

type Message = SolveMessage | CancelMessage

self.onmessage = (ev: MessageEvent<Message>) => {
  switch (ev.data.type) {
    case "solve": return onSolve(ev.data.puzzle)
    case "cancel": return onCancel()
  }
}
