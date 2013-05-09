# long-con

Create a console logger w/ formatting, timestamp, color, namespace

[![Build Status](https://travis-ci.org/codeactual/long-con.png)](https://travis-ci.org/codeactual/long-con)

## Examples

### stdout, timestamp, namespaces

```js
var longCon = require('long-con');.create();
longCon.set('time', true).set('namespace', 'myLib');

var log = longCon.create('cache');

// [Sun, 21 Apr 2013 21:33:20 GMT] myLib cache
log('hit key: %s', 'key-name');
```

### stderr, color, no namespace

```js
// namespace: white foreground, red background
// body: white foreground, green background
var log = longCon.create(null, console.error, 'white.bgRed', 'white.bgGreen');
```

See [cli-color](https://github.com/medikoo/cli-color) for color names.

### Object-specific stack trace

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

Output:

    Klass#foo
    |    foo1
    |    Klass#bar
    |    |    bar1
    |    |    Klass#baz
    |    |    |    baz
    |    |    bar2
    |    foo2


See [traceMethods()](docs/Longcon.md).

## Installation

### [NPM](https://npmjs.org/package/long-con)

    npm install long-con

## API

[Documentation](docs/LongCon.md)

## License

  MIT

## Tests

    npm test
