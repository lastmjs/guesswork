[![CircleCI](https://circleci.com/gh/lastmjs/guesswork.svg?style=shield)](https://circleci.com/gh/lastmjs/guesswork) [![npm version](https://img.shields.io/npm/v/guesswork.svg?style=flat)](https://www.npmjs.com/package/guesswork) [![dependency Status](https://david-dm.org/lastmjs/guesswork/status.svg)](https://david-dm.org/lastmjs/guesswork) [![devDependency Status](https://david-dm.org/lastmjs/guesswork/dev-status.svg)](https://david-dm.org/lastmjs/guesswork?type=dev)

# Guesswork

Framework for property-based testing in JavaScript, TypeScript, JSX, and TSX. Uses [Karma](https://github.com/karma-runner/karma) for automating browser runs and output. Uses [JSVerify](https://github.com/jsverify/jsverify) for property-based testing utilities in JavaScript, similar to what [QuickCheck](https://github.com/nick8325/quickcheck) does in Haskell. Uses [Zwitterion](https://github.com/lastmjs/zwitterion) to seamlessly transpile source code on the fly. Can be run from a terminal or the web GUI. The web GUI allows fine-grained control over which tests to run and how many random inputs to generate. The terminal allows for automatic runs of your test suite.

# Installation

```bash
npm install guesswork
```

# Use

## Headless Runs

Headless runs will automatically execute all of your tests from the `--entry` file with 100 iterations each.

Run headless from the terminal:

```bash
node_modules/.bin/guesswork chromium firefox safari electron --entry test/index.js
```

Run headless from an npm script:

```json
// package.json
{
  "scripts": {
    "test": "guesswork chromium firefox safari electron --entry test/index.js"
  }
}
```

## Web GUI Runs

Web GUI runs will open up a port on `localhost`. You can go to that port in any browser and have fine-grained manual control over which tests to run and how many iterations of random inputs should be generated. To get the port to open, just leave out any browsers from the command line arguments.

Run the web GUI from the terminal:

```bash
node_modules/.bin/guesswork --entry test/index.js
```

Run the web GUI from an npm script:

```json
// package.json
{
  "scripts": {
    "test-gui": "guesswork --entry test/index.js"
  }
}
```

## Entry File

The entry point to your tests should be a JavaScript file. When you instruct the tests to execute, the file will be loaded into the browser as an ES Module. You can import all of your [test suites](#test-suites) into the entry file using ES Modules. You should also import the `test-runner` custom element from Guesswork. Once you have loaded all of your dependencies, write to the DOM and create your full test suite by inserting each of your test suite custom elements as children of your `test-runner` element:

```javascript
// test/index.js

import './test-suite-1.js';
import './test-suite-2.ts';
import './test-suite-3.jsx';
import './test-suite-4.tsx';
import '../node_modules/guesswork/test-runner.ts';

window.document.body.innerHTML = `
    <test-runner>
        <test-suite-1></test-suite-1>
        <test-suite-2></test-suite-2>
        <test-suite-3></test-suite-3>
        <test-suite-4></test-suite-4>
    </test-runner>
`;
```

## Test Suites

Each test suite is created as an HTML [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). You must define a `prepareTests` method on the class of your custom element. That function has one parameter, which is the Guesswork test preparation function. This function is used to create individual test cases. Here is an example test suite:

```javascript
// test/test-suite-1.js

import jsverify from 'jsverify-es-module';

class TestSuite1 extends HTMLElement {
  prepareTests(test) {
    test('Addition is commutative', [jsverify.integer, jsverify.integer], (arbInt1, arbInt2) => {
      return arbInt1 + arbInt2 === arbInt2 + arbInt1;
    });
    
    test('Addition is associative', [jsverify.integer, jsverify.integer, jsverify.integer], (arbInt1, arbInt2, arbInt3) => {
      return (arbInt1 + arbInt2) + arbInt3 === arbInt1 + (arbInt2 + arbInt3);
    });
  }
}

window.customElements.define('test-suite-1', TestSuite1);
```

## Browsers

Specify which browsers you desire for your headless runs as command line arguments. The following browser command line arguments are available:

* `chromium`
* `firefox`
* `safari`
* `edge`
* `electron`

You must install each of these browsers separately on the machine your tests will be running on. Only truly headless browsers will be run headless (Chromium and Firefox for now). Each browser launch is managed by its associated [Karma browser launcher](http://karma-runner.github.io/2.0/config/browsers.html), which is installed along with Guesswork. If you have any questions about hooking up your browser, see the documentation in the appropriate browser launcher repo:

* `chromium`: [karma-chrome-launcher](https://github.com/karma-runner/karma-chrome-launcher)
* `firefox`: [karma-firefox-launcher](https://github.com/karma-runner/karma-firefox-launcher)
* `safari`: [karma-safari-launcher](https://github.com/karma-runner/karma-safari-launcher)
* `edge`: [karma-edge-launcher](https://github.com/karma-runner/karma-edge-launcher)
* `electron`: [karma-electron](https://github.com/twolfson/karma-electron)
