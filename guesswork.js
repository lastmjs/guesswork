#!/usr/bin/env node

//TODO Fix arguments, allow for specifiying browsers in any order
//TODO add port option for zwitterion to arguments
//TODO allow the entry file to be anywhere in the arguments
//TODO Get all browsers to exit when guesswork exits
//TODO Make sure logging from browsers, both stdout and stderr and anything else works correctly
//TODO allow for passing in custom arguments for each browser
//TODO firefox-nightly doesn't ever open, probably because of the -

const child_process = require('child_process');
const program = require('commander');
const jsverify = require('jsverify');
let pastValues = [];

(async () => {
    program
        .version('0.7.4')
        .parse(process.argv);

    const fileToOpen = program.args[program.args.length - 1];
    const browsersToOpen = program.args.slice(0, program.args.length - 1);
    const zwitterionPort = 57632;

    //TODO decide if arbitrary ports are better or if one port is better, passed in by the user. One port for all browsers are individual ports for each browser
    await loadZwitterion(zwitterionPort);

    for (let i=0; i < browsersToOpen.length; i++) {
        //TODO decide if arbitrary ports are better or if one port is better, passed in by the user. One port for all browsers are individual ports for each browser
        // const zwitterionPort = getArbPort();
        // await loadZwitterion(zwitterionPort);

        const childProcess = child_process.spawn(browsersToOpen[i], ['--new-window', `http://localhost:${zwitterionPort}/${fileToOpen}`]);

        childProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        childProcess.on('error', (error) => {
            console.log(error);
        });
    }
})();

function loadZwitterion(port) {
    return new Promise((resolve, reject) => {
        const zwitterionProcess = child_process.fork('node_modules/.bin/zwitterion', ['--port', `${port}`]);

        zwitterionProcess.on('error', (error) => {
            console.log(error);
        });

        zwitterionProcess.on('message', (e) => {
            if (e === 'ZWITTERION_LISTENING') {
                resolve(zwitterionProcess);
            }
        });
    });
}

function getArbPort() {
    const arbPort = jsverify.bless({
        generator: () => {
            return getNewValue();
        }
    });

    return jsverify.sampler(arbPort)();
}


function getNewValue() {
    const potentialValue = jsverify.sampler(jsverify.integer(6000, 10000))();

    if (pastValues.includes(potentialValue)) {
        return getNewValue();
    }
    else {
        pastValues = [...pastValues, potentialValue];
        return potentialValue;
    }
}
