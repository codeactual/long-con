# long-con

Create a console logger w/ formatting, timestamp, color, namespace

[![Build Status](https://travis-ci.org/codeactual/long-con.png)](https://travis-ci.org/codeactual/long-con)

## Example: Timestamp and namespace

```js
var lc = require('long-con');.create();
longCon.set('time', true).set('namespace', 'myLib');

var log = longCon.create('cache');

// [Sun, 21 Apr 2013 21:33:20 GMT] myLib cache
log('hit key: %s', 'key-name');
```

## Example: Object-specific stack trace w/ `traceMethods()`

```js
function Klass() {
  this.console = longCon.create();
  this.log = this.console.create(null, console.log);
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
Klass.prototype.baz = function() {
  this.log('baz');
};
(new Klass()).foo();
```

`console.log()` receives:

    Klass#foo
    |    foo1
    |    Klass#bar
    |    |    bar1
    |    |    Klass#baz
    |    |    |    baz
    |    |    bar2
    |    foo2

## Installation

### [NPM](https://npmjs.org/package/long-con)

    npm install long-con

## API

[Documentation](docs/LongCon.md)

## License

  MIT

## Tests

    npm test
