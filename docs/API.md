  - [exports.LongCon](#exportslongcon)
  - [exports.create()](#exportscreate)
  - [exports.extend()](#exportsextendextobject)
  - [LongCon()](#longcon)
  - [LongCon.log()](#longconlognamestringfnfunctionnamecolorstringbodycolorbooleanstringargsmixed)
  - [LongCon.create()](#longconcreate)
  - [LongCon.traceMethods()](#longcontracemethodsnamestringobjobjectloggerfunctionfilterallregexpobjectomitnoneregexp)

## exports.LongCon

  LongCon constructor.

## exports.create()

  Return a new LongCon() instance.

## exports.extend(ext:object)

  Extend `LongCon.prototype`

## LongCon()

  Usage:
  
```js
  var longCon = require('long-con').create(); // new LongCon() instance
```

  
  Example configuration:
  
```js
  loncCon
    .set('namespace', 'myLib');
  var log = longCon.create('[stderr]', console.error, 'red.bold');
```

  
```js
  // [stderr] myLib error message: ...
  log('error message: %s', ...);
```

  
  Configuration:
  
   - `{string} [namespace='']` Prepend to each message
   - `{string} [nlFirst=false]` Prepend `\n` to first log
   - `{string} [quiet=false]` Drop all messages
   - `{string} [time=false]` Prepend `toUTCString()`
   - `{string} [traceIndent='    ']` Represent a stack level
   - `{string} [traceLanes=true]` Prepend each traceIndent with '|'
  
  Properties:
  
   - `{number} [stackDepth=0]` Used to size indentation and draw trace lanes
   - `{boolean} firstLine` Supports `nlFirst` config option

## LongCon.log(name:string, fn:function, nameColor:string, bodyColor:boolean|string, args*:mixed)

  `util.format()` wrapper with timestamp and injected output function.
  Respects `--quiet`. Applies color selection.
  
  Parameters:
  
  - `bodyColor`
   - `{boolean}` If true, match 'nameColor'
   - `{string}` Custom cli-color

## LongCon.create()

  Create a `log()` wrapper with fixed arguments.
  
  Returned function's properties:
  
  - `{function} push`: Accepts same args. Pushes a stack level.
  - `{function} pop`: Accepts same args. Pops a stack level.

## LongCon.traceMethods(name:string, obj:object, logger:function, [filter=all]:regexp|object, [omit=none]:regexp)

  Wrap an object's methods to allow log messages to appear within a stack trace
  isolated to that object.
  
  Parameters:
  
  - `filter`: If an object, its keys are used.
