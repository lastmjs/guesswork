#!/usr/bin/env node

//TODO allow for passing in custom arguments for each browser

const path = require('path');
const child_process = require('child_process');
const karma = require('karma');
const program = require('commander');

(async () => {
    program
        .version('0.10.6')
        .option('firefox')
        .option('chromium')
        .option('safari')
        .option('edge')
        .option('electron')
        .option('--electron-window')
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

    await loadZwitterion(zwitterionPort);

    const karmaServer = new karma.Server({
        proxies: {
            '/base/': `http://localhost:${zwitterionPort}/`
        },
        port: karmaPort,
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-edge-launcher',
            ...(program.electron ? ['karma-electron'] : [])
        ],
        files: [{ //TODO including this file is temporary until this is merged: https://github.com/karma-runner/karma/pull/2834 and then we can remove it completely
            pattern: path.join(__dirname, 'temp.js'),
            included: true,
            served: true,
            watched: true
        }, {
            pattern: path.join(process.cwd(), userEntryFile),
            included: true,
            served: true,
            watched: true,
            type: 'module'
        }],
        singleRun: browsers.length !== 0 && !program.electronWindow,
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
                flags: program.electronWindow ? ['show'] : []
            }
        },
        client: {
            clearContext: false,
            // runInParent: true, //TODO Once this https://github.com/karma-runner/karma/issues/2967 is fixed, use runInParent: true and useIframe: false, to get rid of the overhead of an iframe. It should work well
            useIframe: !program.electron
        },
        browserNoActivityTimeout: 1000000
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
