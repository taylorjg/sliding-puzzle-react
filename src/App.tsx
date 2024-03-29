import { useEffect, useState } from "react"
import styled from "styled-components"
import { initGame, PuzzleActions, makePuzzleActions, BoardEventNames } from "./game"
import * as Logic from "./logic"
import { useSolver } from "./useSolver"
import packageJson from "../package.json"

const SOLVED_3x3 = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
]

const SOLVED_4x4 = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 0]
]

const Version = styled.div`
  position: fixed;
  bottom: .5rem;
  right: .5rem;
  font-size: small;
  font-style: italic;
`

const Span = styled.span`
  color: #B22222;
`

const Button = styled.button.attrs<{ disabled: boolean }>(props => ({
  disabled: props.disabled
}))`
  cursor: pointer;
  font-size: 1rem;
  padding: .25rem .5rem;
  border: .15rem #000000 solid;
  border-radius: 0.5rem;
  background-color: #B22222;
  color: #FFD700;
  &:hover:not(:disabled),
  &:active:not(:disabled),
  &:focus {
    color: #FAEBD7;
  }
  &:disabled {
    opacity: 0.7;
  }
`

const Select = styled.select.attrs<{ disabled: boolean }>(props => ({
  disabled: props.disabled
}))`
  cursor: pointer;
  font-size: 1rem;
  padding: .25rem .5rem;
  border: .15rem #000000 solid;
  border-radius: 0.5rem;
  background-color: #B22222;
  color: #FFD700;
`

const MainContent = styled.div`
  width: 480px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* small screens in portrait mode */
  @media only screen and (max-device-width: 479px) and (orientation: portrait) {
    width: 100%;
  }

  /* small and medium screens in landscape mode */
  @media only screen and (max-device-width: 1023px) and (orientation: landscape) {
    width: 100%;
    flex-direction: row;
    align-items: end;
  }
`

interface PuzzleSizeRowProps {
  solving: boolean
  puzzleSize: string;
  onChangePuzzleSize: (value: string) => void;
}

const PuzzleSizeRow: React.FC<PuzzleSizeRowProps> = ({ solving, puzzleSize, onChangePuzzleSize }) => {
  return (
    <div>
      <Span>Puzzle size:</Span>
      &nbsp;
      <Select disabled={solving} value={puzzleSize} onChange={e => onChangePuzzleSize(e.target.value)}>
        <option value="3x3">3 x 3</option>
        <option value="4x4">4 x 4</option>
      </Select>
    </div>
  )
}

// https://stackoverflow.com/questions/19068070/how-to-style-a-div-to-be-a-responsive-square
// http://www.dwuser.com/education/content/creating-responsive-tiled-layout-with-pure-css/
const PuzzleWrapper = styled.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
`

const StyledPuzzle = styled.div.attrs({ id: "puzzle" })`
  position: absolute;
  left: .5rem;
  right: .5rem;
  top: .5rem;
  bottom: .5rem;
  background: #000000;
`

interface PuzzleProps {
  onGameInitialised: (puzzleActions: PuzzleActions) => void
  onTileMoved: (node: Logic.SlidingPuzzleNode) => void
  onFinishedPresentingSolution: () => void
}

const Puzzle: React.FC<PuzzleProps> = ({
  onGameInitialised,
  onTileMoved,
  onFinishedPresentingSolution
}) => {

  useEffect(() => {
    const game = initGame()
    const puzzleActions = makePuzzleActions(game)
    game.events.on(BoardEventNames.GameInitialised, () => onGameInitialised(puzzleActions))
    game.events.on(BoardEventNames.TileMoved, onTileMoved)
    game.events.on(BoardEventNames.FinishedPresentingSolution, onFinishedPresentingSolution)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StyledPuzzle />
  )
}

const Panel1 = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* small and medium screens in landscape mode */
  @media only screen and (max-device-width: 1023px) and (orientation: landscape) {
    /* make the square's size a bit smaller than the available height to allow room for the puzzle size dropdown menu */
    width: 60vh;
  }
`

const Panel2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const PanelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: .5rem;
`

interface MoveCountRowProps {
  moveCount: number
}

const MoveCountRow: React.FC<MoveCountRowProps> = ({ moveCount }) => {
  return (
    <PanelRow>
      <Span>Move count:</Span>
      &nbsp;
      <Span>{moveCount}</Span>
    </PanelRow>
  )
}

interface ButtonsRowProps {
  solving: boolean
  solved: boolean
  onReset: () => void
  onScramble: () => void
  onSolve: () => void
  onCancel: () => void
}

const ButtonsRow: React.FC<ButtonsRowProps> = ({
  solving,
  solved,
  onReset,
  onScramble,
  onSolve,
  onCancel
}) => {
  return (
    <PanelRow>
      <Button onClick={() => onReset()} disabled={solving}>Reset</Button>
      &nbsp;
      <Button onClick={() => onScramble()} disabled={solving}>Scramble</Button>
      &nbsp;
      {
        solving
          ? <Button onClick={() => onCancel()}>Cancel</Button>
          : <Button disabled={solved} onClick={() => onSolve()}>Solve</Button>
      }
    </PanelRow>
  )
}

const getSolvedPuzzle = (puzzleSize: string): number[][] => {
  switch (puzzleSize) {
    case "3x3": return SOLVED_3x3
    case "4x4": return SOLVED_4x4
    default: throw new Error(`unknown puzzleSize ${puzzleSize}`)
  }
}

const getScrambledPuzzle = (puzzleSize: string): number[][] => {
  return Logic.scrambleSolvedPuzzle(getSolvedPuzzle(puzzleSize))
}

const App = () => {

  const [puzzleSize, setPuzzleSize] = useState("3x3")
  const [puzzle, setPuzzle] = useState(getSolvedPuzzle(puzzleSize))
  const [node, setNode] = useState<Logic.SlidingPuzzleNode>()
  const [moveCount, setMoveCount] = useState(0)
  const [solving, setSolving] = useState(false)
  const [puzzleActions, setPuzzleActions] = useState<PuzzleActions | undefined>(undefined)

  const solver = useSolver()

  const onGameInitialised = (puzzleActions: PuzzleActions) => {
    setPuzzleActions(puzzleActions)
    setPuzzle(getScrambledPuzzle(puzzleSize))
  }

  const onTileMoved = (node: Logic.SlidingPuzzleNode) => {
    setNode(node)
    setMoveCount(currentMoveCount => currentMoveCount + 1)
  }

  const onFinishedPresentingSolution = () => {
    setSolving(false)
  }

  const onChangePuzzleSize = (value: string) => {
    setPuzzleSize(value)
  }

  useEffect(() => {
    setPuzzle(getScrambledPuzzle(puzzleSize))
  }, [puzzleSize]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const tiles = Logic.makeTiles(puzzle)
    setNode(new Logic.SlidingPuzzleNode(tiles))
    puzzleActions?.resetBoard(puzzle)
    setMoveCount(0)
  }, [puzzle]) // eslint-disable-line react-hooks/exhaustive-deps

  const onReset = () => {
    // Clone the current puzzle to trigger a rerender.
    setPuzzle(puzzle.slice())
  }

  const onScramble = () => {
    setPuzzle(getScrambledPuzzle(puzzleSize))
  }

  const onSolve = async () => {
    if (solving) return
    if (!node) return
    setSolving(true)
    puzzleActions?.showOverlay()
    const numCols = puzzle[0].length
    const puzzleCurrentState = Logic.puzzleFromNode(node, numCols)
    solver.solve(puzzleCurrentState, solution => {
      puzzleActions?.hideOverlay()
      if (solution) {
        puzzleActions?.startSolutionPresentation(solution)
      }
    })
  }

  const onCancel = () => {
    solver.cancel()
    puzzleActions?.hideOverlay()
    puzzleActions?.cancelSolutionPresentation()
    setSolving(false)
  }

  return (
    <>
      <MainContent>
        <Panel1>
          <PuzzleSizeRow solving={solving} puzzleSize={puzzleSize} onChangePuzzleSize={onChangePuzzleSize} />
          <PuzzleWrapper>
            <Puzzle
              onGameInitialised={onGameInitialised}
              onTileMoved={onTileMoved}
              onFinishedPresentingSolution={onFinishedPresentingSolution}
            />
          </PuzzleWrapper>
        </Panel1>
        <Panel2>
          <MoveCountRow moveCount={moveCount} />
          <ButtonsRow
            solving={solving}
            solved={node?.isSolution}
            onReset={onReset}
            onScramble={onScramble}
            onSolve={onSolve}
            onCancel={onCancel}
          />
        </Panel2>
      </MainContent>
      <Version>version: {packageJson.version}</Version>
    </>
  )
}

export default App
