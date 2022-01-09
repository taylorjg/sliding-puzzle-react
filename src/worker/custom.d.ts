declare module 'comlink-loader!*' {

  class WebpackWorker extends Worker {
    constructor()
    async solve(puzzle: number[][]): Promise<number[] | undefined>
  }

  export = WebpackWorker
}
