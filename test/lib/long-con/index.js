var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var longCon = require('../../..');

require('sinon-doublist')(sinon, 'mocha');

describe('LongCon', function() {
  'use strict';

  beforeEach(function() {
    this.lc = longCon.create();
    this.name = 'mylogger';
    this.fn = this.spy();
    this.color = 'red.bold';
    this.ns = 'lib namespace';
    this.traceIndent = '----';
    this.msg = 'foo';
  });

  describe('#log', function() {
    it('should abort in quiet mode', function() {
      this.lc.set('quiet', true);
      this.lc.log(this.name, this.fn);
      this.fn.should.not.have.been.called;
    });

    it('should use default color', function() {
      this.lc.log(this.name, this.fn, null, null, this.msg);
      this.fn.should.have.been.calledWithExactly('mylogger foo');
    });

    it('should use custom color', function() {
      this.lc.log(this.name, this.fn, this.color, null, this.msg);
      this.fn.should.have.been.calledWithExactly('\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m foo');
    });

    it('should optionally apply color to body', function() {
      this.lc.log(this.name, this.fn, this.color, true, this.msg);
      this.fn.should.have.been.calledWithExactly(
        '\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m \x1B[1m\x1B[31mfoo\x1B[39m\x1B[22m'
      );
    });

    it.skip('should optionally display namespace', function() {
    });

    it.skip('should omit timestamp by default', function() {
    });

    it.skip('should optionally display timestamp', function() {
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
