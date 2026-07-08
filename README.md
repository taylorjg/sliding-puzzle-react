# Description

A little web app to play/solve [sliding puzzles](https://en.wikipedia.org/wiki/Sliding_puzzle).
It is written in TypeScript and uses React for the UI components and Phaser for the graphics.
The algorithm to solve the puzzle is based on [Iterative deepening A*](https://en.wikipedia.org/wiki/Iterative_deepening_A*)
and runs in a web worker.

# Screenshots

_TODO_

# Development

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check and production build
npm run test      # run tests
npm run preview   # preview production build locally
npm run lint      # run ESLint
npm run deploy    # build and publish to GitHub Pages
```

The app is deployed to [GitHub Pages](https://taylorjg.github.io/sliding-puzzle-react/).

# Web Worker

The solver runs in a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) so the UI stays responsive while the puzzle is being solved.

Vite has [built-in web worker support](https://vite.dev/guide/features.html#web-workers). The worker is created in [`src/use-solver.ts`](src/use-solver.ts) with:

```ts
new Worker(new URL('./worker/worker.ts', import.meta.url), { type: 'module' })
```

The `type: 'module'` option is required because the worker uses ES `import` statements. Communication with the main thread uses [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) and [`onmessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/onmessage).

# TODO

* ~~Add an overlay/animation over the board whilst the web worker is trying to find a solution~~
* ~~Implement cancellation of the web worker~~
* Add sound effects

# Links

* [Sliding puzzle](https://en.wikipedia.org/wiki/Sliding_puzzle)
* [Swift implementation of the Sliding Puzzle game with Iterative Deepening A* AI Solver](https://github.com/gsurma/sliding_puzzle)
* [Iterative deepening A*](https://en.wikipedia.org/wiki/Iterative_deepening_A*)
* [Web Workers | Vite](https://vite.dev/guide/features.html#web-workers)
* [Phaser - A fast, fun and free open source HTML5 game framework](https://phaser.io/)
