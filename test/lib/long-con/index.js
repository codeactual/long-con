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
    this.nameColor = 'red.bold';
    this.bodyColor = 'yellow';
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
      this.lc.log(this.name, this.fn, this.nameColor, null, this.msg);
      this.fn.should.have.been.calledWithExactly('\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m foo');
    });

    it('should optionally apply name color to body', function() {
      this.lc.log(this.name, this.fn, this.nameColor, true, this.msg);
      this.fn.should.have.been.calledWithExactly(
        '\x1B[1m\x1B[31mmylogger\x1B[39m\x1B[22m \x1B[1m\x1B[31mfoo\x1B[39m\x1B[22m'
      );
    });

    it('should optionally apply separate color to body', function() {
      this.lc.log(this.name, this.fn, this.nameColor, this.bodyColor, this.msg);
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
    beforeEach(function() {
      this.logStub = this.stub(this.lc, 'log');
      this.logger = this.lc.create(this.name, this.fn, this.nameColor, this.bodyColor);
    });

    describe('produced function', function() {
      it('should partially apply #log', function() {
        this.logger('foo');
        this.logStub.should.have.been.calledWithExactly(
          this.name, this.fn, this.nameColor, this.bodyColor, 'foo'
        );
      });
    });

    describe('produced #push', function() {
      beforeEach(function() {
        this.logger.push('foo');
      });

      it('should partially apply #logger', function() {
        this.logStub.should.have.been.calledWithExactly(
          this.name, this.fn, this.nameColor, this.bodyColor, 'foo'
        );
      });

      it('should update stack depth counter', function() {
        this.lc.stackDepth.should.equal(1);
      });
    });

    describe('produced #pop', function() {
      it('should not partially apply #logger on zero args', function() {
        this.logger.pop();
        this.logStub.should.not.have.been.called;
      });

      it('should optionally allow util.format args', function() {
        this.logger.pop('%s %d', 'foo', 5.0);
        this.logStub.should.have.been.calledWithExactly(
          this.name, this.fn, this.nameColor, this.bodyColor, '%s %d', 'foo', 5.0
        );
      });

      it('should update stack depth counter', function() {
        this.lc.stackDepth.should.equal(0);
        this.logger.push();
        this.lc.stackDepth.should.equal(1);
        this.logger.push();
        this.lc.stackDepth.should.equal(2);
        this.logger.pop();
        this.lc.stackDepth.should.equal(1);
        this.logger.pop();
        this.lc.stackDepth.should.equal(0);
      });
    });
  });

  describe('#traceMethods', function() {
    beforeEach(function() {
      var self = this;
      this.method1Stub = this.stub();
      this.method1Res = {iAmA: 'method1 result'};
      this.method1Stub.returns(this.method1Res);
      this.method2Stub = this.stub();
      this.method2Res = {iAmA: 'method2 result'};
      this.method2Stub.returns(this.method2Res);
      this.obj = {
        num: 5,
        str: 'five',
        arr: [1, 2],
        method1: this.method1Stub,
        method2: this.method2Stub
      };
      this.logger = this.lc.create('mylogger', this.fn);
    });

    it('should trace all methods by default', function() {
      this.lc.traceMethods('someObj', this.obj, this.logger);
      this.obj.method1.call(this.obj);
      this.fn.should.have.been.calledWithExactly('mylogger someObj#method1');
      this.obj.method2.call(this.obj);
      this.fn.should.have.been.calledWithExactly('mylogger someObj#method2');
    });

    it('should optionally filter by regex', function() {
      this.lc.traceMethods('someObj', this.obj, this.logger, /method1/);
      this.obj.method1.call(this.obj);
      this.fn.should.have.been.calledWithExactly('mylogger someObj#method1');
      this.obj.method2.call(this.obj);
      this.fn.should.not.have.been.calledWithExactly('mylogger someObj#method2');
    });

    it('should optionally filter by object keys', function() {
      var self = this;
      function Klass() { // Use case: filter by Klass.prototype keys
        this.console = longCon.create();
        this.log = this.console.create(null, self.fn);
        this.console.traceMethods('Klass', this, this.log, Klass.prototype);
      }
      Klass.prototype.foo = function() {
        this.log('foo1');
        this.bar();
        this.log('foo2');
      };
      Klass.prototype.bar = function() {
        this.log('bar1');
        this.baz();
        this.log('bar2');
      };
      Klass.prototype.baz = function() { this.log('baz'); };
      (new Klass()).foo();
      this.fn.should.have.been.calledWithExactly('Klass#foo');
      this.fn.should.have.been.calledWithExactly('|    foo1');
      this.fn.should.have.been.calledWithExactly('|    Klass#bar');
      this.fn.should.have.been.calledWithExactly('|    |    bar1');
      this.fn.should.have.been.calledWithExactly('|    |    Klass#baz');
      this.fn.should.have.been.calledWithExactly('|    |    |    baz');
      this.fn.should.have.been.calledWithExactly('|    |    bar2');
      this.fn.should.have.been.calledWithExactly('|    foo2');
    });

    it('should optionally omit by regex', function() {
      this.lc.traceMethods('someObj', this.obj, this.logger, null, /1/);
      this.obj.method1.call(this.obj);
      this.fn.should.not.have.been.calledWithExactly('mylogger someObj#method1');
      this.obj.method2.call(this.obj);
      this.fn.should.have.been.calledWithExactly('mylogger someObj#method2');
    });

    it('should ignore non-function prop', function() {
      this.lc.traceMethods('someObj', this.obj, this.logger);
      this.obj.num.should.equal(5);
      this.obj.str.should.equal('five');
      this.obj.arr.should.deep.equal([1, 2]);
    });

    describe('method wrapper', function() {
      it('should update trace level', function() {
        var pushSpy = this.spy(this.logger, 'push');
        var popSpy = this.spy(this.logger, 'pop');
        this.lc.traceMethods('someObj', this.obj, this.logger);
        this.obj.method1.call(this.obj);
        pushSpy.should.have.been.calledWithExactly('someObj#method1');
        popSpy.should.have.been.calledWithExactly();
      });

      it('should call method transparently', function() {
        this.lc.traceMethods('someObj', this.obj, this.logger);

        this.obj.method1.call(this.obj, 'foo', 'bar').should.equal(this.method1Res);
        this.method1Stub.should.have.been.calledWithExactly('foo', 'bar');
        this.method1Stub.should.have.been.calledOn(this.obj);

        this.obj.method2.call(this.obj, 'bar', 'foo').should.equal(this.method2Res);
        this.method2Stub.should.have.been.calledWithExactly('bar', 'foo');
        this.method2Stub.should.have.been.calledOn(this.obj);
      });
    });
  });
});
