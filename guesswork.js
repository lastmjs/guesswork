#!/usr/bin/env node

//TODO Fix arguments, allow for specifiying browsers in any order
//TODO add port option for zwitterion to arguments
//TODO allow the entry file to be anywhere in the arguments
//TODO Get all browsers to exit when guesswork exits
//TODO Make sure logging from browsers, both stdout and stderr and anything else works correctly

const child_process = require('child_process');
const program = require('commander');

(async () => {
    program
        .version('0.7.1')
        .parse(process.argv);

    const fileToOpen = program.args[program.args.length - 1];
    const browsersToOpen = program.args.slice(0, program.args.length - 1);
    const zwitterionPort = 5000;

    await loadZwitterion(zwitterionPort);

    browsersToOpen.forEach((browsersToOpen) => {
        const childProcess = child_process.spawn(browsersToOpen, ['--new-window', `http://localhost:${zwitterionPort}/${fileToOpen}`]);

        childProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        childProcess.on('error', (error) => {
            console.log(error);
        });
    });
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
