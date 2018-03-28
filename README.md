[![CircleCI](https://circleci.com/gh/lastmjs/guesswork.svg?style=shield)](https://circleci.com/gh/lastmjs/guesswork) [![npm version](https://img.shields.io/npm/v/guesswork.svg?style=flat)](https://www.npmjs.com/package/guesswork) [![dependency Status](https://david-dm.org/lastmjs/guesswork/status.svg)](https://david-dm.org/lastmjs/guesswork) [![devDependency Status](https://david-dm.org/lastmjs/guesswork/dev-status.svg)](https://david-dm.org/lastmjs/guesswork?type=dev)

# Guesswork

Framework for property-based testing in JavaScript. Uses [Karma](https://github.com/karma-runner/karma) for automating browser runs and output. Uses [JSVerify](https://github.com/jsverify/jsverify) for property-based testing utilities in JavaScript, similar to what [QuickCheck](https://github.com/nick8325/quickcheck) does in Haskell. Can be run from a terminal or the web GUI. The web GUI allows fine-grained control over which tests to run and how many random inputs to generate. The terminal allows for automatic runs of your test suite.

# Installation

```bash
npm install guesswork
```

# Use

Guesswork uses [Scram.js](https://github.com/scramjs/scram-engine) to run your tests. Visit the Scram.js [project page](https://github.com/scramjs/scram-engine) if you need more help than you can find here.

Run headless tests from the terminal:

```bash
node_modules/.bin/electron --enable-logging node_modules/scram-engine/main.js --entry-file test/index.html --auto-run
```

Run headless tests from an npm script:

```json
// package.json
{
  "scripts": {
    "test": "electron --enable-logging node_modules/scram-engine/main.js --entry-file test/index.html --auto-run"
  }
}
```

Run the test GUI from the terminal:

```bash
node_modules/.bin/electron --enable-logging node_modules/scram-engine/main.js --entry-file test/index.html --test-window
```

Run the test GUI from an npm script:

```json
// package.json
{
  "scripts": {
    "test-window": "electron --enable-logging node_modules/scram-engine/main.js --entry-file test/index.html --test-window"
  }
}
```

* Run any Chromium or Node.js code (client or server)
* Works on the popular continuous integration servers
* Show how the GUI works
* Make a video
* Show how the console works
