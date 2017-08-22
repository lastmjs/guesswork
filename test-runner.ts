import {html} from '../lit-html/lit-html';
import {render} from '../lit-html/lib/lit-extended';

interface TestComponent extends Element {
    shouldRunValue: boolean;
    numTestsValue: number;
    prepareTests;
    tests: Test[];
}

class TestRunner extends HTMLElement {
    _autoRun: boolean;
    render: any;
    showChildren: boolean;
    testComponents: TestComponent[];

    constructor() {
        super();

        this._autoRun = false;
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
        this.runTests();
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
    }

    async runTests() {
        delete require.cache[require.resolve('tape')]; //this is necessary so that tape will run tests fresh each time. Apparently it keeps some state around that does not let the tests run multiple times
        const tape = require('tape');
        const {ipcRenderer} = require('electron');
        const jsc = require('jsverify');

        tape.onFinish((event) => {
            if (this.autoRun) {
                ipcRenderer.sendSync('kill-all-processes-successfully');
            }
        });

        // Using for loops to allow easy async for each
        for (let i=0; i < this.testComponents.length; i++) {
            const testComponent = this.testComponents[i];
            for (let j=0; j < testComponent.tests.length; j++) {
                const test = testComponent.tests[j];
                // autoRun will run all tests
                const shouldRun = this.autoRun ? true : this.shadowRoot.querySelector(`#${this.getShouldRunInputId(test.description)}`).checked;
                if (shouldRun) {
                    //TODO if you are auto running the tests, just do 100 for now. We will allow the number of tests to be configured on an auto run later
                    const numTests = this.autoRun ? '100' : this.shadowRoot.querySelector(`#${this.getNumTestsInputId(test.description)}`).value;
                    //TODO deal with async issues, make sure each test waits appropriately
                    await tape(test.description, async (assert) => {
                        const result = await jsc.check(jsc.forall(...test.jsverifyCallbackParams, test.jsverifyCallback), {
                            tests: numTests,
                            size: 1000000
                        });

                        if (result !== true && this.autoRun === true) { //only kill the process if you are set to autoRun, which I assume means the component is being run in a continuous integration environment
                            ipcRenderer.sendSync('kill-all-processes-unsuccessfully'); //TODO remove this once tape has an on failure handler
                        }

                        assert.equal(result, true);
                        assert.end();
                    });
                }
            }
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
                    cursor: pointer;
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
                    padding: 10px;
                }

                .numTestsInputContainer {
                    width: 3vw;
                }
            </style>

            <button onclick="${() => this.runTests.bind(this)}">Run tests</button>

            <br>
            <br>

            <div class="gridWrapper">
                ${this.testComponents.map((testComponent) => {
                    return html`
                        <div class="componentCheckboxContainer">
                            <input id="${this.getShouldRunInputId(testComponent.localName || 'localNameWasNotDefined')}" type="checkbox" onchange="${() => this.componentShouldRunInputOnChanged.bind(this)}" checked="${testComponent.shouldRunValue}">
                        </div>
                        <div class="componentNumTestsInputContainer">
                            <input id="${this.getNumTestsInputId(testComponent.localName || 'localNameWasNotDefined')}" type="number" oninput="${() => this.componentNumTestsInputOnInput.bind(this)}" value="${testComponent.numTestsValue}" class="numTestsInputContainer">
                        </div>
                        <div class="componentLabelContainer" onclick="${() => this.showChildrenClick.bind(this)}">
                            <${testComponent.localName}>
                        </div>

                        ${() => {
                            if (this.showChildren) {
                                return testComponent.tests.map((test) => {
                                    return html`
                                        <div class="testCheckboxContainer">
                                            <input id="${this.getShouldRunInputId(test.description)}" type="checkbox" onchange="${() => this.testShouldRunInputOnChanged.bind(this)}" checked="${test.shouldRunValue}">
                                        </div>
                                        <div class="testNumTestsInputContainer">
                                            <input id="${this.getNumTestsInputId(test.description)}" type="number" oninput="${() => this.testNumTestsInputOnInput.bind(this)}" value="${test.numTestsValue}" class="numTestsInputContainer">
                                        </div>
                                        <div class="testLabelContainer">
                                            ${test.description}
                                        </div>
                                    `;
                                });
                            }
                        }}
                    `;
                })}
            </div>
        `, this.shadowRoot);
    }
}

window.customElements.define('test-runner', TestRunner);
