import { describe, expect, it } from "vitest"
import * as Logic from "./index"

const SOLVED_3x3 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
]

describe("makeTiles", () => {
  it("recognises a solved 3x3 puzzle", () => {
    const tiles = Logic.makeTiles(SOLVED_3x3)
    const node = new Logic.SlidingPuzzleNode(tiles)

    expect(node.isSolution).toBe(true)
  })
})

describe("getChildOfNodeAndMove", () => {
  it("moves the blank tile right into the solved state", () => {
    const puzzle = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8],
    ]
    const node = new Logic.SlidingPuzzleNode(Logic.makeTiles(puzzle))
    const child = Logic.getChildOfNodeAndMove(node, Logic.MOVE_RIGHT)

    expect(Logic.puzzleFromNode(child, 3)).toEqual(SOLVED_3x3)
  })
})

describe("scrambleSolvedPuzzle", () => {
  it("preserves puzzle dimensions", () => {
    const scrambled = Logic.scrambleSolvedPuzzle(SOLVED_3x3)

    expect(scrambled).toHaveLength(3)
    expect(scrambled[0]).toHaveLength(3)
  })
})

describe("solve", () => {
  it("solves a one-move puzzle", async () => {
    const puzzle = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8],
    ]
    const node = new Logic.SlidingPuzzleNode(Logic.makeTiles(puzzle))
    const path = await Logic.solve(node)

    expect(path).toBeTruthy()
    expect(path!.length).toBeGreaterThanOrEqual(2)
    expect(path![path!.length - 1].isSolution).toBe(true)
  })

  it("returns a path for an already-solved puzzle", async () => {
    const node = new Logic.SlidingPuzzleNode(Logic.makeTiles(SOLVED_3x3))
    const path = await Logic.solve(node)

    expect(path).toHaveLength(1)
    expect(path![0].isSolution).toBe(true)
  })
})
