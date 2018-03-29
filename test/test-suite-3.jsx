import jsverify from 'jsverify-es-module';

class TestSuite3 extends HTMLElement {
  prepareTests(test) {
    test('Multiplication is commutative', [jsverify.integer, jsverify.integer], (arbInt1, arbInt2) => {
      return arbInt1 * arbInt2 === arbInt2 * arbInt1;
    });

    test('Multiplication is associative', [jsverify.integer, jsverify.integer, jsverify.integer], (arbInt1, arbInt2, arbInt3) => {
      return (arbInt1 * arbInt2) * arbInt3 === arbInt1 * (arbInt2 * arbInt3);
    });
  }
}

window.customElements.define('test-suite-3', TestSuite3);
