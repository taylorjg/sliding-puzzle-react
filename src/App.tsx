import { useState } from "react"
import styled from "styled-components"

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

interface PuzzleSizeProps {
  puzzleSize: string;
  onChangePuzzleSize: (value: string) => void;
}

const PuzzleSize: React.FC<PuzzleSizeProps> = ({ puzzleSize, onChangePuzzleSize }) => {
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

const PuzzleInner = styled.div`
  position: absolute;
  left: .5rem;
  right: .5rem;
  top: .5rem;
  bottom: .5rem;
  background: #66F;
`

const StyledPanel1 = styled.div`
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

interface Panel1Props extends PuzzleSizeProps {
}

const Panel1: React.FC<Panel1Props> = ({ puzzleSize, onChangePuzzleSize }) => {
  return (
    <StyledPanel1>
      <PuzzleSize puzzleSize={puzzleSize} onChangePuzzleSize={onChangePuzzleSize} />
      <PuzzleOuter>
        <PuzzleInner />
      </PuzzleOuter>
    </StyledPanel1>
  )
}

const StyledPanelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: .5rem;
`

const StyledPanel2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Panel2 = () => {
  return (
    <StyledPanel2>
      <StyledPanelRow>
        <span>Move count:</span>
        &nbsp;
        <span>0</span>
      </StyledPanelRow>

      <StyledPanelRow>
        <button>Reset</button>
        &nbsp;
        <button>Scramble</button>
        &nbsp;
        <button>Solve</button>
      </StyledPanelRow>

      <StyledPanelRow>
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
      </StyledPanelRow>
    </StyledPanel2>
  )
}

const App = () => {

  const [puzzleSize, setPuzzleSize] = useState('4x4')

  const onChangePuzzleSize = (value: string) => {
    setPuzzleSize(value)
  }

  return (
    <MainContent>
      <Panel1 puzzleSize={puzzleSize} onChangePuzzleSize={onChangePuzzleSize} />
      <Panel2 />
    </MainContent>
  )
}

export default App
