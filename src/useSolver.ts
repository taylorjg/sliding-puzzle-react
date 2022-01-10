import { useRef } from "react"

export const useSolver = () => {

  const workerRef = useRef<Worker>()

  const getworker = () => {
    if (!workerRef.current) {
      const worker = new Worker(new URL('./worker/worker.ts', import.meta.url))
      workerRef.current = worker
    }
    return workerRef.current
  }

  const solve = (puzzle: number[][], onComplete: (solution: number[] | undefined) => void) => {
    const worker = getworker()
    worker.postMessage({ type: "solve", puzzle })
    worker.onmessage = (ev: MessageEvent<number[] | undefined>) => {
      const solution = ev.data
      onComplete(solution)
    }
  }

  const cancel = () => {
    const worker = getworker()
    worker.postMessage({ type: "cancel" })
  }

  return { solve, cancel }
}
