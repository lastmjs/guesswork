#!/usr/bin/env node

//TODO Fix arguments, allow for specifiying browsers in any order
//TODO add port option for zwitterion to arguments
//TODO allow the entry file to be anywhere in the arguments
//TODO allow for passing in custom arguments for each browser
//TODO firefox-nightly doesn't ever open, probably because of the -
//TODO allow for automated testing in ci environments...use karma, probably

const path = require('path');
const child_process = require('child_process');
const karma = require('karma');
const program = require('commander');

(async () => {
    program
        .version('0.9.3')
        .option('firefox')
        .option('chromium')
        .option('safari')
        .option('edge')
        .option('electron')
        .option('--entry [entry]')
        .option('--port [port]')
        .parse(process.argv);

    const browsers = [
        ...(program.firefox ? ['FirefoxHeadlessWithFlags'] : []),
        ...(program.chromium ? ['ChromiumHeadless'] : []),
        ...(program.safari ? ['Safari'] : []),
        ...(program.edge ? ['Edge'] : []),
        ...(program.electron ? ['ElectronCustom'] : [])
    ];

    const karmaPort = +program.port || 5000;
    const zwitterionPort = karmaPort + 1;

    const userEntryFile = program.entry;

    //TODO decide if arbitrary ports are better or if one port is better, passed in by the user. One port for all browsers are individual ports for each browser
    await loadZwitterion(zwitterionPort);

    let guessworkPlugin = function(files) {
        //TODO including this file is temporary until this is merged: https://github.com/karma-runner/karma/pull/2834 and then we can remove it completely
        files.unshift({
            pattern: path.join(__dirname, 'temp.js'),
            included: true,
            served: true,
            watched: true,
            // type: 'module'
        });

        files.unshift({
            pattern: path.join(process.cwd(), userEntryFile),
            included: true,
            served: true,
            watched: true,
            type: 'module'
        });
    };

    guessworkPlugin.$inject = ['config.files'];

    const karmaServer = new karma.Server({
        proxies: {
            '/base/': `http://localhost:${zwitterionPort}/`
        },
        port: karmaPort,
        plugins: [
            {
                'framework:guesswork': ['factory', guessworkPlugin]
            },
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-edge-launcher',
            'karma-electron'
        ],
        frameworks: ['guesswork'],
        singleRun: browsers.length !== 0,
        browsers,
        customLaunchers: {
            FirefoxHeadlessWithFlags: {
                base: 'FirefoxHeadless',
                prefs: {
                    'dom.moduleScripts.enabled': true //TODO Get rid of this flag once Firefox supports modules (should be the next release, Firefox 60)
                }
            },
            ElectronCustom: {
                base: 'Electron',
                // flags: ['show']
            }
        },
        client: {
            clearContext: false
        }
    }, (exitCode) => {
        console.log(`Karma has exited with ${exitCode}`);
        process.exit(exitCode);
    });

    karmaServer.start();
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

// const program = require('commander');
// const jsverify = require('jsverify');
// let pastValues = [];
//
// (async () => {
//     program
//         .version('0.7.6')
//         .parse(process.argv);
//
//     const fileToOpen = program.args[program.args.length - 1];
//     const browsersToOpen = program.args.slice(0, program.args.length - 1);
//     const zwitterionPort = 57632;
//
//     //TODO decide if arbitrary ports are better or if one port is better, passed in by the user. One port for all browsers are individual ports for each browser
//     await loadZwitterion(zwitterionPort);
//
//     for (let i=0; i < browsersToOpen.length; i++) {
//         //TODO decide if arbitrary ports are better or if one port is better, passed in by the user. One port for all browsers are individual ports for each browser
//         // const zwitterionPort = getArbPort();
//         // await loadZwitterion(zwitterionPort);
//
//         const childProcess = child_process.spawn(browsersToOpen[i], ['--new-window', `http://localhost:${zwitterionPort}/${fileToOpen}`]);
//
//         childProcess.stdout.on('data', (data) => {
//             console.log(data.toString());
//         });
//
//         childProcess.on('error', (error) => {
//             console.log(error);
//         });
//     }
// })();
//

//
// function getArbPort() {
//     const arbPort = jsverify.bless({
//         generator: () => {
//             return getNewValue();
//         }
//     });
//
//     return jsverify.sampler(arbPort)();
// }
//
//
// function getNewValue() {
//     const potentialValue = jsverify.sampler(jsverify.integer(6000, 10000))();
//
//     if (pastValues.includes(potentialValue)) {
//         return getNewValue();
//     }
//     else {
//         pastValues = [...pastValues, potentialValue];
//         return potentialValue;
//     }
// }
