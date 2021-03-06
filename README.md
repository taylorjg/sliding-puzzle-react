# Description

A little web app to play/solve [sliding puzzles](https://en.wikipedia.org/wiki/Sliding_puzzle).
It is written in TypeScript and uses React for the UI components and Phaser for the graphics.
The algorithm to solve the puzzle is based on [Iterative deepening A*](https://en.wikipedia.org/wiki/Iterative_deepening_A*)
and runs in a web worker.

# Screenshots

_TODO_

# Web Worker

Initially, I implemented the web worker by following this blog post:

[Use Web Workers in Create React App without ejecting and TypeScript](https://dev.to/cchanxzy/use-web-workers-in-create-react-app-without-ejecting-and-typescript-2ap5)

It all worked fine in development (`npm run start`) but failed in a production build deployed to gh-pages (`npm run build`).

```
comlink.ts:265 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'apply')
    at e (d76e50226ea8f7d4a973.worker.js:1)
```

I noticed that there was a missing peer dependency:

```
$ npm ls --depth 0
...
npm ERR! peer dep missing: webpack@^3.0.0 || ^4.0.0-alpha.0 || ^4.0.0, required by worker-loader@2.0.0
```

It seems that my project, created using [Create React App](https://create-react-app.dev/),
was using a more recent version of webpack:

```
$ npm ls webpack                 
sliding-puzzle-react@0.0.5 /Users/jontaylor/Documents/HomeProjects/sliding-puzzle-react
└─┬ react-scripts@5.0.0
  └── webpack@5.65.0 
```

I then stumbled across https://webpack.js.org/guides/web-workers/ which says:

> As of webpack 5, you can use Web Workers without worker-loader.

So I removed [comlink-loader](https://www.npmjs.com/package/comlink-loader)
and changed my implementation to something more basic
(using [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) and
[onmessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/onmessage)) and it all works fine now.
I then created a [custom hook](src/useSolver.ts) to wrap the mechanics of communicating with the web worker.

# TODO

* ~~Add an overlay/animation over the board whilst the web worker is trying to find a solution~~
* ~~Implement cancellation of the web worker~~
* Add sound effects

# Links

* [Sliding puzzle](https://en.wikipedia.org/wiki/Sliding_puzzle)
* [Swift implementation of the Sliding Puzzle game with Iterative Deepening A* AI Solver](https://github.com/gsurma/sliding_puzzle)
* [Iterative deepening A*](https://en.wikipedia.org/wiki/Iterative_deepening_A*)
* [Use Web Workers in Create React App without ejecting and TypeScript](https://dev.to/cchanxzy/use-web-workers-in-create-react-app-without-ejecting-and-typescript-2ap5)
* [comlink-loader](https://www.npmjs.com/package/comlink-loader)
* [Web Workers | webpack](https://webpack.js.org/guides/web-workers/)
* [Phaser - A fast, fun and free open source HTML5 game framework](https://phaser.io/)
