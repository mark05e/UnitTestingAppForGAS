//jshint esversion: 9

/************************
 * TESTS
 ************************/

/**
 * Class for running unit tests
 */

let UnitTestingApp = (function () {

  const _enabled = new WeakMap();
  const _runningInGas = new WeakMap();
  const _nTests = new WeakMap();      // Total number of tests executed
  const _nFailTests = new WeakMap();  // Total test failed
  const _nPassTests = new WeakMap();  // Total test passed
  const _levelInfo = new WeakMap();   // Level of information to show in the output (0-summary, 1-trace and test result information)

  class UnitTestingApp {
    constructor() {
      if (UnitTestingApp.instance) return UnitTestingApp.instance;

      _enabled.set(this, false);
      _runningInGas.set(this, false);
      _levelInfo.set(this, 1);
      _nTests.set(this, 0);
      _nFailTests.set(this, 0);
      _nPassTests.set(this, 0);
      UnitTestingApp.instance = this;

      return UnitTestingApp.instance;
    }

    enable() {
      _enabled.set(this, true);
    }

    disable() {
      _enabled.set(this, false);
    }

    get isEnabled() {
      return _enabled.get(this);
    }

    get isInGas() {
      return typeof ScriptApp !== 'undefined';
    }

    get runningInGas() {
      return _runningInGas.get(this);
    }

    runInGas(bool = true) {
      _runningInGas.set(this, bool);
    }

    clearConsole() {
      if (console.clear) console.clear();
    }

    getLevelInfo() {
      return _levelInfo.get(this);
    }

    setLevelInfo(value) {
      _levelInfo.set(this, value);
    }

    resetTestCounters() {
      _nTests.set(this, 0);
      _nFailTests.set(this, 0);
      _nPassTests.set(this, 0);
    }

    /**
     * Tests whether conditions pass or not
     * @param {Boolean | Function} condition - The condition to check
     * @param {String} message - the message to display in the console (based on _levelInfo value)
     * @return {void}
     */
    assert(condition, message) {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      _nTests.set(this, _nTests.get(this) + 1);
      try {
        if ("function" === typeof condition) condition = condition();
        if (condition) {
          _nPassTests.set(this, _nPassTests.get(this) + 1);
          if (this.getLevelInfo() > 0) console.log(`✔ PASSED: ${message}`);
        }
        else {
          _nFailTests.set(this, _nFailTests.get(this) + 1);
          if (this.getLevelInfo() > 0) console.log(`❌ FAILED: ${message}`);
        }

      } catch (err) {
        _nFailTests.set(this, _nFailTests.get(this) + 1);
        if (this.getLevelInfo() > 0) console.log(`❌ FAILED: ${message} (${err})`);
      }
    }

    /**
     * Tests whether fun result is equal to expected result or not
     * @param {Boolean | Function} Condition or fun - to check
     * @param {String} expectedResult - The expected result to validate
     * @param {String} message - If present, then used as message to display in the console (based on _levelInfo value). 
     *                           If message is not present, then in case the result is not equal, it shows the missmatch
     *                           In the form of: "result != expectedResult". If the result is valid and message is not 
     *                           provided, then it only indicates the test passed.
     * @return {void}
     */
    assertEquals(fun, expectedResult, message = null) {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      _nTests.set(this, _nTests.get(this) + 1);
      let msg, result;

      try {
        // Checking preconditions
        if(fun === undefined) throw new Error("Provide 'fun' input argument");
        if(expectedResult === undefined) throw new Error("Provide 'expectedResult' input argument");

        ("function" === typeof fun) ? result = fun() : result = fun;
        let condition = expectedResult === result;
        if (condition) {
          _nPassTests.set(this, _nPassTests.get(this) + 1);
          msg = (message == null) ? "" : ": " + message;
          if (this.getLevelInfo() >= 1) console.log(`✔ PASSED${msg}`);
        }
        else {
          _nFailTests.set(this, _nFailTests.get(this) + 1);
          msg = (message == null) ? result + " != " + expectedResult : message;
          if (this.getLevelInfo() >= 1) console.log(`❌ FAILED: ${msg}`);
        }

      } catch (err) {
        _nFailTests.set(this, _nFailTests.get(this) + 1);
        if ((fun === undefined) || (expectedResult === undefined)) {
          msg ="";
        } else {
           msg = (message == null) ? result + " != " + expectedResult : message;
        }
        if (this.getLevelInfo() >= 1) console.log(`❌ FAILED(err): ${msg} (${err})`);
      }
    }


    /**
     * Tests functions that throw error messages
     * @param {Function} callback - the function that you expect to return the error message
     * @param {String} errorMessage - the error message you are expecting
     * @param {String} message - the message to display in the console
     * @return {void}
     */
    catchErr(callback, errorMessage, message) {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      let error;
      let isCaught = false;
      try {
        callback();
      } catch (err) {
        error = err;
        isCaught = new RegExp(errorMessage).test(err);
      } finally {
        this.assert(isCaught, message);
      }
    }

    /**
     * Tests whether an the argument is a 2d array
     * @param {*[][]} array - any 2d-array
     * @returns {Boolean}
     */
    is2dArray(array, message) {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      try {
        if (typeof array === 'function') array = array();
        this.assert(Array.isArray(array) && Array.isArray(array[0]), message);
      } catch (err) {
        this.assert(false, `${message}: ${err}`);
      }
    }

    printHeader(text) {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      if (this.getLevelInfo() > 0) {
        console.log('*********************');
        console.log('* ' + text)
        console.log('*********************');
      }
    }

    printSubHeader(text) {
      if (!_enabled.get(this)) return;
      if (this.getLevelInfo() > 0) { console.log('** ' + text) };
    }

    printSummary() {
      if (!_enabled.get(this)) return;
      if (this.isInGas !== this.runningInGas) return;
      if (this.getLevelInfo() > 0) {
        console.log('TOTAL TESTS= ' + _nTests.get(this) + ', ❌ FAILED='
          + _nFailTests.get(this) + ', ✔ PASSED=' + _nPassTests.get(this));
      }
      console.log((_nFailTests.get(this) == 0) ? "ALL TESTS ✔ PASSED" : "❌ Some Tests Failed");
    }

    /**
     * Adds a new test to the prototype of the class
     * @param {String} name the name of the function
     * @param {Function} callback the function to add to the prototype of the class
     */
    addNewTest(name, callback) {
      UnitTestingApp.prototype[name] = callback;
    }
  }
  return UnitTestingApp;
})();

if (typeof module !== "undefined") module.exports = UnitTestingApp;
