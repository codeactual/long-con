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
    this.ns = 'myLib';
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

    it('should optionally apply name color to body', function() {
      this.lc.log(this.name, this.fn, this.color, true, this.msg);
      this.fn.should.have.been.calledWithExactly(
        '\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m \x1B[1m\x1B[31mfoo\x1B[39m\x1B[22m'
      );
    });

    it('should optionally apply separate color to body', function() {
      this.lc.log(this.name, this.fn, this.color, 'yellow', this.msg);
      this.fn.should.have.been.calledWithExactly(
        '\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m \x1B[33mfoo\x1B[39m'
      );
    });

    it('should optionally display namespace', function() {
      this.lc.set('namespace', this.ns);
      this.lc.log(this.name, this.fn, null, null, this.msg);
      this.fn.should.have.been.calledWithExactly('myLib mylogger foo');
    });

    it('should optionally display timestamp', function() {
      this.lc.set('time', true);
      this.lc.log(this.name, this.fn, null, null, this.msg);
      this.fn.should.have.been.calledWithExactly('[Thu, 01 Jan 1970 00:00:00 GMT] mylogger foo');
    });

    it('should optionally display lanes', function() {
      this.lc.set('traceLanes', true);
      var logger = this.lc.create(this.name, this.fn);
      logger('1');
      this.fn.should.have.been.calledWithExactly('mylogger 1');
      logger.push('2');
      this.fn.should.have.been.calledWithExactly('mylogger 2');
      logger.push('3');
      this.fn.should.have.been.calledWithExactly('mylogger |    3');
      logger('4');
      this.fn.should.have.been.calledWithExactly('mylogger |    |    4');
      logger('5');
      this.fn.should.have.been.calledWithExactly('mylogger |    |    5');
      logger.push('6');
      this.fn.should.have.been.calledWithExactly('mylogger |    |    6');
      logger('7');
      this.fn.should.have.been.calledWithExactly('mylogger |    |    |    7');
    });

    it('should accept util.format args', function() {
      this.lc.log(this.name, this.fn, null, null, '%s %j', 'foo', {a: 'b'});
      this.fn.should.have.been.calledWithExactly('mylogger foo {"a":"b"}');
    });

    it('should optionally prepend newline to 1st line', function() {
      this.lc.set('nlFirst', true);
      this.lc.log(this.name, this.fn, null, null, 'foo');
      this.lc.log(this.name, this.fn, null, null, 'bar');
      this.fn.should.have.been.calledWithExactly('\nmylogger foo');
      this.fn.should.have.been.calledWithExactly('mylogger bar');
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
