import '../node_modules/@webcomponents/shadydom/shadydom.min.js';
import '../node_modules/@webcomponents/custom-elements/custom-elements.min.js';
import './test-suite-1.js';
import '../test-runner.ts';

window.document.body.innerHTML = `
    <test-runner>
        <test-suite-1></test-suite-1>
    </test-runner>
`;
