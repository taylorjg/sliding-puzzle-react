declare module 'comlink-loader!*' {

  class WebpackWorker extends Worker {
    constructor()
    solve(puzzle: number[][]): Promise<number[]>
  }

  export = WebpackWorker
}
