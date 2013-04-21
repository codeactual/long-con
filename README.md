# long-con

Create a console logger w/ formatting, timestamp, color, namespace

[![Build Status](https://travis-ci.org/codeactual/long-con.png)](https://travis-ci.org/codeactual/long-con)

## Example: Timestamp and namespace

```js
var lc = longCon.create();
lc.set('time', true).set('namespace', 'myLib');

var log = lc.create('cache');

// [Sun, 21 Apr 2013 21:33:20 GMT] myLib cache
log('hit key: %s', 'key-name');
```

## Installation

### [NPM](https://npmjs.org/package/long-con)

    npm install long-con

## API

### create()

> Return a new LongCon instance.

## License

  MIT

## Tests

    npm test
