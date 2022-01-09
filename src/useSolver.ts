import { useRef } from "react"

export const useSolver = () => {

  const workerRef = useRef<Worker>()

  const solve = (puzzle: number[][], onComplete: (solution: number[] | undefined) => void) => {

    if (!workerRef.current) {
      const worker = new Worker(new URL('./worker/worker.ts', import.meta.url))
      workerRef.current = worker
    }

    workerRef.current.postMessage({ puzzle })
    
    workerRef.current.onmessage = (messageEvent: MessageEvent<{ solution: number[] | undefined }>) => {
      const solution = messageEvent.data.solution
      onComplete(solution)
    }
  }

  return solve
}
