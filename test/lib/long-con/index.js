var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var nc = require('../../..');

var requireComponent = require('../../../lib/component/require');

require('sinon-doublist')(sinon, 'mocha');

describe('LongCon', function() {
  'use strict';

  beforeEach(function() {
    this.lc = lc.create();
  });

  describe('#log', function() {
    it.skip('should abort in quiet mode', function() {
    });

    it.skip('should use default color', function() {
    });

    it.skip('should use custom color', function() {
    });

    it.skip('should not apply color to body by default', function() {
    });

    it.skip('should optionally apply color to body', function() {
    });

    it.skip('should optionally display namespace', function() {
    });

    it.skip('should display timestamp by default', function() {
    });

    it.skip('should optionally omit timestamp', function() {
    });

    it.skip('should optionally display lanes', function() {
    });

    it.skip('should accept util.format args', function() {
    });

    it.skip('should optionally prepend newline to 1st line', function() {
    });
  });

  describe('#create', function() {
    describe('produced function', function() {
      it.skip('should partially apply #log', function() {
      });
    });

    describe('produced #push', function() {
      it.skip('should partially apply #logger', function() {
      });
    });

    describe('produced #pop', function() {
      it.skip('should partially apply #logger', function() {
      });

      it.skip('should update trace depth counter', function() {
      });
    });
  });

  describe('#traceMethods', function() {
    it.skip('should optionally filter by method', function() {
    });

    it.skip('should optionally omit by method', function() {
    });

    it.skip('should ignore non-function prop', function() {
    });

    describe('method wrapper', function() {
      it.skip('should push trace level', function() {
      });

      it.skip('should call method transparently', function() {
        // context
        // arguments
        // return val
      });

      it.skip('should pop trace level', function() {
      });
    });
  });
});
