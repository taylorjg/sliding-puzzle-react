import styled from "styled-components"

const MainContent = styled.div`
  width: 480px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const PuzzleSize = () => {
  return (
    <div>
      <span>Puzzle size:</span>
      &nbsp;
      <select>
        <option>3x3</option>
        <option selected>4x4</option>
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
`

const Panel1 = () => {
  return (
    <StyledPanel1>
      <PuzzleSize />
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
        <input type="range" min="0" max="1" step="0.1" list="tickmarks" value="0.2" />
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
  return (
    <MainContent>
      <Panel1 />
      <Panel2 />
    </MainContent>
  )
}

export default App
