/**
 * Create a console logger w/ formatting, timestamp, color, namespace
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

/**
 * Reference to LongCon.
 */
exports.LongCon = LongCon;

/**
 * Create a new LongCon.
 *
 * @return {LongCon}
 */
exports.create = function() { return new LongCon(); };

/**
 * Extend LongCon.prototype.
 *
 * @param {object} ext Methods to mix in.
 * @return {object} Merge result.
 */
exports.extend = function(ext) { return extend(LongCon.prototype, ext); };

var clc = require('cli-color');
var util = require('util');
var sprintf = util.format;

var requireComponent = require('../component/require');
var configurable = requireComponent('configurable.js');
var extend  = requireComponent('extend');
var is  = requireComponent('is');
var tea = requireComponent('tea-properties');
var getProp = tea.get;
var setProp = tea.set;

/**
 * LongCon constructor.
 *
 * Usage:
 *
 *     var longCon = require('long-con').create(); // new LongCon() instance
 *
 * Example configuration:
 *
 *     loncCon
 *       .set('namespace', 'myLib');
 *     var log = longCon.create('[stderr]', console.error, 'red.bold');
 *
 *     // [stderr] myLib error message: ...
 *     log('error message: %s', ...);
 *
 * Configuration:
 *
 *  - `{string} [namespace='']` Prepend to each message
 *  - `{string} [nlFirst=false]` Prepend `\n` to first log
 *  - `{string} [quiet=false]` Drop all messages
 *  - `{string} [time=false]` Prepend `toUTCString()`
 *  - `{string} [traceIndent='    ']` Represent a stack level (default: 4 spaces)
 *  - `{string} [traceLanes=true]` Prepend each traceIndent with `|`
 *
 * Properties:
 *
 *  - `{number} [stackDepth=0]` Used to size indentation and draw trace lanes
 *  - `{boolean} firstLine` Supports `nlFirst` config option
 *
 * @see cli-color https://github.com/medikoo/cli-color
 */
function LongCon() {
  this.settings = {
    namespace: '',
    nlFirst: false,
    quiet: false,
    time: false,
    traceIndent: '    ',
    traceLanes: true
  };

  this.stackDepth = 0;
  this.firstLine = true;
}

configurable(LongCon.prototype);

/**
 * `util.format()` wrapper with timestamp and injected output function.
 * Respects `quiet` config. Applies color selection.
 *
 * Parameters:
 *
 * - `bodyColor`
 *  - `{boolean}` If true, match 'nameColor'
 *  - `{string}` Custom cli-color
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. `console.error`
 * @param {string} nameColor `name` color, ex. 'yellow' or 'white.bgRed'
 * - `cli-color` foreground and optional background
 * @param {boolean|string} bodyColor
 *   {boolean} If true, match `nameColor`
 *   {string} Custom `cli-color`
 * @param {mixed} args* `util.format()` compatible
 * @see cli-color https://github.com/medikoo/cli-color
 */
LongCon.prototype.log = function(name, fn, nameColor, bodyColor) {
  if (this.get('quiet')) { return; }
  var nameColorFn = nameColor ? getProp(clc, nameColor) : longConDefColorFn;
  var namespace = this.get('namespace');
  var indent = '';

  var bodyColorFn;
  if (bodyColor === true) {
    bodyColorFn = nameColorFn;
  } else if (typeof bodyColor === 'string') {
    bodyColorFn = getProp(clc, bodyColor);
  } else {
    bodyColorFn = longConDefColorFn;
  }

  // Build indentation/lanes if push() and pop() were used.
  var traceIndent = this.get('traceIndent');
  var laneCx = traceIndent.length;
  indent = (new Array(this.stackDepth + 1)).join(traceIndent);
  if (this.get('traceLanes')) { // Prepend '|' to  every traceIndent section
    indent = indent.replace(new RegExp('.{1,' + laneCx + '}', 'g'), '|$&');
  }

  var sections = [
    this.get('time') ? '[' + (new Date()).toUTCString() + '] ' : '',
    namespace ? namespace + ' ' : '',
    name ? nameColorFn(name) + ' ' : '',
    indent,
    bodyColorFn(sprintf.apply(null, [].slice.call(arguments, 4)))
  ];
  var joined = sections.join('');

  // Ensure 1st line starts at col 0 for lane alignment
  if (this.firstLine && this.get('nlFirst')) {
    joined = '\n' + joined;
    this.firstLine = false;
  }

  fn(joined);
};

/**
 * Create a LongCon.prototype.log wrapper with fixed arguments.
 *
 * Returned function ('primary') also has two properties.
 *
 * - `{function} push`: Emits a log message and pushes a stack level.
 *   - Accepts same arguments as primary.
 * - `{function} pop`: Pops a stack level. Optionally emits a log message.
 *   - Optionally accepts same arguments as primary.
 *
 * @see LongCon.prototype.log for fixable arguments
 * @return {function} Accepts `util.format()` arguments
 */
LongCon.prototype.create = function(name, fn, nameColor, bodyColor) {
  var self = this;
  function logger() {
    self.log.apply(self, [name, fn, nameColor, bodyColor].concat([].slice.call(arguments)));
  }
  logger.push = function longConPush() {
    logger.apply(self, arguments); self.stackDepth++;
  };
  logger.pop = function longConPop() {
    self.stackDepth--;
    if (arguments.length) { logger.apply(self, arguments); }
  };
  return logger;
};

/**
 * Wrap an object's methods to allow log messages to appear within a stack trace
 * isolated to that object.
 *
 * Parameters:
 *
 * - `filter`: If an object, its keys are used.
 *
 * @param {string} name Uniquely identify the object
 * @param {object} obj
 * @param {function} logger From LongCon.prototype.create
 * @param {regexp|object} [filter=all] Include matching key names
 * @param {regexp} [omit=none] Exclude matching key names
 */
LongCon.prototype.traceMethods = function(name, obj, logger, filter, omit) {
  var self = this;
  var methods;

  if (!is.regexp(filter) && is.object(filter)) {
    methods = Object.keys(filter);
    filter = null;
  } else {
    methods = Object.keys(obj);
  }

  filter = filter || /.?/;
  omit = omit || /a^/;

  methods.forEach(function longConTraceMethodsIter(key) {
    if (typeof obj[key] !== 'function') { return; }
    if (!filter.test(key) || omit.test(key)) { return; }
    var orig = obj[key];
    obj[key] = function longConTraceMethodsWrapper() {
      logger.push(name + '#' + key);
      var res = orig.apply(this, arguments);
      logger.pop();
      return res;
    };
  });
};

function longConDefColorFn(str) { return str; }
