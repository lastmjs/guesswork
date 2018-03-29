import jsverify from 'jsverify-es-module';

class TestSuite2 extends HTMLElement {
  prepareTests(test) {
    test('Zero is the subtractive identity', [jsverify.integer], (arbInt1) => {
      return arbInt1 - 0 === arbInt1;
    });

    test('Subtraction is equalative', [jsverify.integer, jsverify.integer], (arbInt1, arbInt2) => {
      return arbInt1 - arbInt2 === arbInt1 - arbInt2;
    });
  }
}

window.customElements.define('test-suite-2', TestSuite2);
