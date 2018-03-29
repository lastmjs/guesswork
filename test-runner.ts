import {html, render} from 'lit-html/lib/lit-extended.js';
import jsverify from 'jsverify-es-module';

if (window.__karma__) {
    window.__karma__.start = (karma) => {
    };
}

interface TestComponent extends Element {
    shouldRunValue: boolean;
    numTestsValue: number;
    prepareTests;
    tests: Test[];
}

class TestRunner extends HTMLElement {
    _autoRun: boolean;
    numTests: number;
    render: any;
    showChildren: boolean;
    testComponents: TestComponent[];

    constructor() {
        super();

        this._autoRun = false;
        this.numTests = 100;
        this.render = null;
    }

    static get observedAttributes() {
        return [
            'auto-run'
        ];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'auto-run': {
                this.autoRun = newValue;
                break;
            }
        }
    }

    set autoRun(val) {
        this._autoRun = val;
    }

    get autoRun() {
        return this._autoRun;
    }

    getLocalNameFromShouldRunInputId(id: string) {
        return id.replace('-should-run-input', '');
    }

    getLocalNameFromNumTestsInputId(id: string) {
        return id.replace('-num-tests-input', '');
    }

    replaceSpaces(string: string) {
        return string.split(' ').join('-');
    }

    getShouldRunInputId(string: string) {
        return `${this.replaceSpaces(string)}-should-run-input`;
    }

    getNumTestsInputId(string: string) {
        return `${this.replaceSpaces(string)}-num-tests-input`;
    }

    getLabelContainerId(string: string) {
        return `${this.replaceSpaces(string)}-label-container-input`;
    }

    getComponentLabelContainerId(string: string) {
        return `${this.replaceSpaces(string)}-component-label-container`;
    }

    showChildrenClick() {
        this.showChildren = !this.showChildren;

        this.stateChange();
    }

    componentShouldRunInputOnChanged(event: Event) {
        const input: HTMLInputElement = <HTMLInputElement> event.target;

        window.localStorage.setItem(input.id, input.checked.toString());
        const localName = this.getLocalNameFromShouldRunInputId(input.id);
        const testComponent = this.testComponents.find((testComponent) => {
            return testComponent.localName === localName;
        });

        if (!testComponent) {
            throw 'testComponent was not found, but should have been found';
        }

        testComponent.shouldRunValue = input.checked;
        this.stateChange();

        testComponent.tests.forEach((test) => {
            const shouldRunInput: HTMLInputElement = <HTMLInputElement> this.shadowRoot.querySelector(`#${this.getShouldRunInputId(test.description)}`);
            shouldRunInput.checked = input.checked;
            shouldRunInput.dispatchEvent(new Event('change'));
            test.shouldRunValue = input.checked;
            this.stateChange();
        });
    }

    testShouldRunInputOnChanged(event: Event) {
        const input: HTMLInputElement = <HTMLInputElement> event.target;

        window.localStorage.setItem(input.id, input.checked.toString());

        const testComponent = this.testComponents.find((testComponent) => {
            return testComponent.tests.find((test) => {
                return test.shouldRunInputId === input.id;
            });
        });

        if (!testComponent) {
            throw 'testComponent was not found, but should have been found';
        }

        const test = testComponent.tests.find((test) => {
            return test.shouldRunInputId === input.id;
        });

        test.shouldRunValue = input.checked;
        this.stateChange();
    }

    componentNumTestsInputOnInput(event: Event) {
        const input: HTMLInputElement = <HTMLInputElement> event.target;

        window.localStorage.setItem(input.id, input.value);
        const localName = this.getLocalNameFromNumTestsInputId(input.id);
        const testComponent = this.testComponents.find((testComponent) => {
            return testComponent.tests.find((test) => {
                return test.localName === localName;
            });
        });

        if (!testComponent) {
            throw 'testComponent was not found, but should have been found';
        }

        testComponent.numTestsValue = +input.value;
        this.stateChange();

        testComponent.tests.forEach((test) => {
            const numTestsInput: HTMLInputElement = <HTMLInputElement> this.shadowRoot.querySelector(`#${this.getNumTestsInputId(test.description)}`);
            numTestsInput.value = input.value;
            numTestsInput.dispatchEvent(new Event('input'));
            test.numTestsValue = input.value;
            this.stateChange();
        });
    }

    testNumTestsInputOnInput(event: Event) {
        const input: HTMLInputElement = <HTMLInputElement> event.target;

        window.localStorage.setItem(input.id, input.value);

        const testComponent = this.testComponents.find((testComponent) => {
            return testComponent.tests.find((test) => {
                return test.numTestsInputId === input.id;
            });
        });

        if (!testComponent) {
            throw 'testComponent was not found, but should have been found';
        }

        const test = testComponent.tests.find((test) => {
            return test.numTestsInputId === input.id;
        });

        test.numTestsValue = input.value;
        this.stateChange();
    }

    connectedCallback() {
        if (window.__karma__) {
            this.autoRun = true;
        }

        //TODO I don't know if this is the best way to do this, but I'm using the event loop to wait until the children to initialize
        if (Array.from(this.children).length > 0 && !Array.from(this.children)[0].prepareTests) {
            setTimeout(() => {
                this.connectedCallback();
            });
            return;
        }

        this.attachShadow({mode: 'open'});

        //TODO we might want to grab the children from the slot instead of just all of the children of the component
        this.testComponents = Array.from(this.children).map((testComponent) => {
            testComponent.shouldRunValue = window.localStorage.getItem(this.getShouldRunInputId(testComponent.localName)) === 'true' ? true : false;
            testComponent.numTestsValue = window.localStorage.getItem(this.getNumTestsInputId(testComponent.localName));
            testComponent.prepareTests && testComponent.prepareTests((description, jsverifyCallbackParams, jsverifyCallback) => {
                testComponent.tests = [...(testComponent.tests || []), {
                    shouldRunInputId: this.getShouldRunInputId(description),
                    numTestsInputId: this.getNumTestsInputId(description),
                    localName: testComponent.localName,
                    description,
                    jsverifyCallbackParams,
                    jsverifyCallback,
                    shouldRunValue: window.localStorage.getItem(this.getShouldRunInputId(description)) === 'true' ? true : false,
                    numTestsValue: window.localStorage.getItem(this.getNumTestsInputId(description))
                }];
            });
            return testComponent;
        });

        this.stateChange();

        this.showChildrenClick();

        const totalNumTests = this.testComponents.reduce((result, testComponent) => {
            return result + testComponent.tests.length;
        }, 0);

        if (window.__karma__) {
            window.__karma__.info({
                total: totalNumTests
            });
            this.runTests();
        }
    }

    async runTests() {
        // Using for loops to allow easy async for each
        for (let i=0; i < this.testComponents.length; i++) {
            const testComponent = this.testComponents[i];
            let allTestPassed = true;
            for (let j=0; j < testComponent.tests.length; j++) {
                const test = testComponent.tests[j];
                // autoRun will run all tests
                const shouldRun = this.shadowRoot.querySelector(`#${this.getShouldRunInputId(test.description)}`).checked || this.autoRun;
                if (shouldRun) {
                    const numTests = this.shadowRoot.querySelector(`#${this.getNumTestsInputId(test.description)}`).value || this.numTests;

                    console.log(test.description);

                    this.shadowRoot.querySelector(`#${this.getLabelContainerId(test.description)}`).style.backgroundColor = 'white';

                    let testNumber = 0;
                    const result = await jsverify.check(jsverify.forall(...test.jsverifyCallbackParams, async (...args) => {
                        const correct = await test.jsverifyCallback(...args);

                        if (correct) {
                            testNumber = testNumber + 1;
                            this.shadowRoot.querySelector(`#${this.getLabelContainerId(test.description)}-success-meter`).style = `flex: ${testNumber}; background-color: #6C4`;
                            this.shadowRoot.querySelector(`#${this.getLabelContainerId(test.description)}-unfinished-meter`).style = `flex: ${numTests - testNumber}; background-color: white`;
                        }

                        await wait(0);
                        return correct;
                    }), {
                        tests: numTests,
                        size: 1000000
                    });

                    if (result !== true) {
                        allTestPassed = false;
                    }

                    if (window.__karma__) {
                        window.__karma__.result({
                            id: test.description,
                            description: test.description,
                            suite: [],
                            log: [result],
                            success: result === true,
                            skipped: false
                        });
                    }
                }
            }

            if (allTestPassed) {
                this.shadowRoot.querySelector(`#${this.getComponentLabelContainerId(testComponent.localName)}`).style = `background-color: #6C4`;
            }
            else {
                this.shadowRoot.querySelector(`#${this.getComponentLabelContainerId(testComponent.localName)}`).style = `background-color: #F99`;
            }
        }

        this.autoRun = false;

        if (window.__karma__) {
            window.__karma__.complete();
        }
    }

    stateChange() {
        render(html`
            <slot></slot>

            <style>
                /*TODO This isn't working with lit-html, and is host the correct selector here? Once it's fixed, use this variable for all of the box-shadows */
                :host {
                    --box-shadow: 0px 0px 1px black;
                }

                .gridWrapper {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 10fr 10fr;
                    grid-gap: 10px;
                    grid-auto-rows: minmax(50px, auto);
                }

                .componentCheckboxContainer {
                    grid-column: 1;
                    box-shadow: 0px 0px 1px black;
                }

                .componentNumTestsInputContainer {
                    grid-column: 2;
                    box-shadow: 0px 0px 1px black;
                }

                .componentLabelContainer {
                    grid-column: 3 / 5;
                    box-shadow: 0px 0px 1px black;
                    padding: 10px;
                }

                .testCheckboxContainer {
                    grid-column: 2;
                    box-shadow: 0px 0px 1px black;
                }

                .testNumTestsInputContainer {
                    grid-column: 3;
                    box-shadow: 0px 0px 1px black;
                }

                .testLabelContainer {
                    grid-column: 4 / 5;
                    box-shadow: 0px 0px 1px black;
                    display: flex;
                    position: relative;
                }

                .numTestsInputContainer {
                    width: 3vw;
                }
            </style>

            <button onclick="${() => this.runTests()}">Run tests</button>

            <br>
            <br>

            <div class="gridWrapper">
                ${this.testComponents.map((testComponent) => {
                    return html`
                        <div class="componentCheckboxContainer">
                            <input id="${this.getShouldRunInputId(testComponent.localName || 'localNameWasNotDefined')}" type="checkbox" onchange="${(e: Event) => this.componentShouldRunInputOnChanged(e)}" checked="${testComponent.shouldRunValue}">
                        </div>
                        <div class="componentNumTestsInputContainer">
                            <input id="${this.getNumTestsInputId(testComponent.localName || 'localNameWasNotDefined')}" type="number" oninput="${(e: Event) => this.componentNumTestsInputOnInput(e)}" value="${testComponent.numTestsValue}" class="numTestsInputContainer">
                        </div>
                        <div id="${this.getComponentLabelContainerId(testComponent.localName || 'localNameWasNotDefined')}" class="componentLabelContainer">
                            <${testComponent.localName}>
                        </div>

                        ${(() => {
                            if (this.showChildren) {
                                return testComponent.tests.map((test) => {
                                    return html`
                                        <div class="testCheckboxContainer">
                                            <input id="${this.getShouldRunInputId(test.description)}" type="checkbox" onchange="${(e: Event) => this.testShouldRunInputOnChanged(e)}" checked="${test.shouldRunValue}">
                                        </div>
                                        <div class="testNumTestsInputContainer">
                                            <input id="${this.getNumTestsInputId(test.description)}" type="number" oninput="${(e: Event) => this.testNumTestsInputOnInput(e)}" value="${test.numTestsValue}" class="numTestsInputContainer">
                                        </div>
                                        <div id="${this.getLabelContainerId(test.description)}" class="testLabelContainer">
                                            <div style="position: absolute; top: 25%; left: 2%">${test.description}</div>
                                            <div id="${this.getLabelContainerId(test.description)}-success-meter"></div>
                                            <div id="${this.getLabelContainerId(test.description)}-unfinished-meter"></div>
                                        </div>
                                    `;
                                });
                            }
                        })()}
                    `;
                })}
            </div>
        `, this.shadowRoot);
    }
}

window.customElements.define('test-runner', TestRunner);

function wait(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
