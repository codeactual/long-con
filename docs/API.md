  - [LongCon()](#longcon)
  - [LongCon.log()](#longconlognamestringfnfunctionnamecolorstringbodycolorbooleanstringargsmixed)
  - [LongCon.create()](#longconcreatenamestringfnfunctionnamecolorfnstringbodycolorbooleanstring)
  - [LongCon.traceMethods()](#longcontracemethodsnamestringobjobjectloggerfunctionfilterregexpobjectomitregexp)

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
   - `{string} [nlFirst=false]` Prepend \n to first log
   - `{string} [quiet=false]` Drop all messages
   - `{string} [time=false]` Prepend toUTCString()
   - `{string} [traceIndent='    ']` Represent a stack level
   - `{string} [traceLanes=true]` Prepend each traceIndent with '|'
  
  Properties:
  
   - `{number} [stackDepth=0]` Used to size indentation and draw trace lanes
   - `{boolean} firstLine` Supports `nlFirst` config option

## LongCon.log(name:string, fn:function, nameColor:string, bodyColor:boolean|string, args*:mixed)

  util.format() wrapper with timestamp and injected output function.
  Respects --quiet. Applies color selection.

## LongCon.create(name:string, fn:function, nameColorFn:string, bodyColor:boolean|string)

  Create a log() wrapper with fixed arguments.

## LongCon.traceMethods(name:string, obj:object, Logger:function, filter:regexp|object, omit:regexp)

  Wrap an object's methods to automatically push/pop for (sync) tracing.
  
  Parameter notes:
  
  - `filter`: If an object, its keys are used.
