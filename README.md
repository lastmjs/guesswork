[![CircleCI](https://circleci.com/gh/lastmjs/guesswork.svg?style=shield)](https://circleci.com/gh/lastmjs/guesswork) [![npm version](https://img.shields.io/npm/v/guesswork.svg?style=flat)](https://www.npmjs.com/package/guesswork) [![dependency Status](https://david-dm.org/lastmjs/guesswork/status.svg)](https://david-dm.org/lastmjs/guesswork) [![devDependency Status](https://david-dm.org/lastmjs/guesswork/dev-status.svg)](https://david-dm.org/lastmjs/guesswork?type=dev)

# Guesswork

Framework for property-based testing in JavaScript. Uses [Karma](https://github.com/karma-runner/karma) for automating browser runs and output. Uses [JSVerify](https://github.com/jsverify/jsverify) for property-based testing utilities in JavaScript, similar to what [QuickCheck](https://github.com/nick8325/quickcheck) does in Haskell. Can be run from a terminal or the web GUI. The web GUI allows fine-grained control over which tests to run and how many random inputs to generate. The terminal allows for automatic runs of your test suite.

# Installation

```bash
npm install guesswork
```

# Use

//TODO explain the file structure and web component structure of creating a test suite

## Headless Runs

Headless runs will automatically run all of your tests from the `--entry` file with 100 iterations each.

Run headless from the terminal:

```bash
node_modules/.bin/guesswork chromium firefox safari --entry test/index.js
```

Run headless from an npm script:

```json
// package.json
{
  "scripts": {
    "test": "guesswork chromium firefox safari --entry test/index.js"
  }
}
```

## Web GUI Runs

Run the web GUI from the terminal:

```bash
node_modules/.bin/guesswork chromium firefox safari --entry test/index.js
```

Access the 

Run the test GUI from an npm script:

```json
// package.json
{
  "scripts": {
    "test-window": "electron --enable-logging node_modules/scram-engine/main.js --entry-file test/index.html --test-window"
  }
}
```
## Browsers

Specify which browsers you desire for your headless runs as command line arguments. The following browsers are available:

* `chromium`
* `firefox`
* `safari`
* `edge`

You must install each of these browsers separately on the machine your tests will be running on. Each browser launch is run by its associated karma launcher plugin. See `package.json` for those dependencies. Only truly headless browsers will be run headless (Chromium and Firefox for now).
