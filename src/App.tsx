import { useEffect, useState } from "react"
import styled from "styled-components"
import { initGame } from './game'

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
  }
`

interface PuzzleSizeRowProps {
  puzzleSize: string;
  onChangePuzzleSize: (value: string) => void;
}

const PuzzleSizeRow: React.FC<PuzzleSizeRowProps> = ({ puzzleSize, onChangePuzzleSize }) => {
  return (
    <div>
      <span>Puzzle size:</span>
      &nbsp;
      <select value={puzzleSize} onChange={e => onChangePuzzleSize(e.target.value)}>
        <option value="3x3">3 x 3</option>
        <option value="4x4">4 x 4</option>
      </select>
    </div>
  )
}

const PuzzleOuter = styled.div`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
`

const StyledPuzzleInner = styled.div.attrs({ id: 'puzzle' })`
  position: absolute;
  left: .5rem;
  right: .5rem;
  top: .5rem;
  bottom: .5rem;
  background: #000000;
`

const PuzzleInner = () => {

  useEffect(() => {
    const game = initGame()
    console.dir(game)
  }, [])

  return (
    <StyledPuzzleInner />
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
    width: 80vh;
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

const HideablePanelRow = styled(PanelRow) <{ hidden: boolean }>`
  visibility: ${props => props.hidden ? 'hidden' : 'visible'};
`

interface MoveCountRowProps {
  moveCount: number
}

const MoveCountRow: React.FC<MoveCountRowProps> = ({ moveCount }) => {
  return (
    <PanelRow>
      <span>Move count:</span>
      &nbsp;
      <span>{moveCount}</span>
    </PanelRow>
  )
}

interface ButtonsRowProps {
  solving: boolean
  onReset: () => void
  onScramble: () => void
  onSolve: () => void
  onCancel: () => void
}

const ButtonsRow: React.FC<ButtonsRowProps> = ({
  solving,
  onReset,
  onScramble,
  onSolve,
  onCancel
}) => {
  return (
    <PanelRow>
      <button onClick={() => onReset()} disabled={solving}>Reset</button>
      &nbsp;
      <button onClick={() => onScramble()} disabled={solving}>Scramble</button>
      &nbsp;
      {
        solving
          ? <button onClick={() => onCancel()}>Cancel</button>
          : <button onClick={() => onSolve()}>Solve</button>
      }
    </PanelRow>
  )
}

interface AnimationSpeedRowProps {
  solving: boolean
}

const AnimationSpeedRow: React.FC<AnimationSpeedRowProps> = ({ solving }) => {
  return (
    <HideablePanelRow hidden={!solving}>
      <span>Animation speed:</span>
      &nbsp;
      <input type="range" min="0" max="1" step="0.1" list="tickmarks" defaultValue="0.2" />
      <datalist id="tickmarks">
        <option value="0.0"></option>
        <option value="0.1"></option>
        <option value="0.2"></option>
        <option value="0.3"></option>
        <option value="0.4"></option>
        <option value="0.5"></option>
        <option value="0.6"></option>
        <option value="0.7"></option>
        <option value="0.8"></option>
        <option value="0.9"></option>
        <option value="1.0"></option>
      </datalist>
    </HideablePanelRow>
  )
}

const App = () => {

  const [puzzleSize, setPuzzleSize] = useState('4x4')
  const [moveCount, setMoveCount] = useState(0)
  const [solving, setSolving] = useState(false)

  const onChangePuzzleSize = (value: string) => {
    setPuzzleSize(value)
  }

  const onReset = () => {
    setMoveCount(0)
  }

  const onScramble = () => {
    setMoveCount(0)
  }

  const onSolve = () => {
    setSolving(true)
  }

  const onCancel = () => {
    setSolving(false)
  }

  return (
    <MainContent>
      <Panel1>
        <PuzzleSizeRow puzzleSize={puzzleSize} onChangePuzzleSize={onChangePuzzleSize} />
        <PuzzleOuter>
          <PuzzleInner />
        </PuzzleOuter>
      </Panel1>
      <Panel2>
        <MoveCountRow moveCount={moveCount} />
        <ButtonsRow
          solving={solving}
          onReset={onReset}
          onScramble={onScramble}
          onSolve={onSolve}
          onCancel={onCancel}
        />
        <AnimationSpeedRow solving={solving} />
      </Panel2>
    </MainContent>
  )
}

export default App
