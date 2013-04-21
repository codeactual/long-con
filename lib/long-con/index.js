/**
 * Create a console logger w/ formatting, timestamp, color, namespace
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  LongCon: LongCon,
  create: function() { return new LongCon(); },
  extend: function(ext) { extend(LongCon.prototype, ext); }
};

var clc = require('cli-color');
var util = require('util');
var sprintf = util.format;

var requireComponent = require('../component/require');
var configurable = requireComponent('configurable.js');
var extend  = requireComponent('extend');
var tea = requireComponent('tea-properties');
var getProp = tea.get;
var setProp = tea.set;

function LongCon() {
  this.settings = {
    namespace: '', // Prepend to each message
    nlFirst: false, // Prepend \n to first log
    quiet: false, // Drop all messages
    time: false, // Prepend toUTCString()
    traceIndent: '    ', // Represent a trace level
    traceLanes: true // Prepend each traceIndent with '|'
  };

  this.traceDepth = 0;
  this.firstLine = true;
}

configurable(LongCon.prototype);

/**
 * util.format() wrapper with timestamp and injected output function.
 * Respects --quiet. Applies color selection.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {string} nameColor 'name' string cli-color, ex. 'red.bold' or 'yellow'
 * @param {boolean|string} bodyColor
 *   {boolean} If true, match 'nameColor'.
 *   {string} Custom cli-color.
 * @param {mixed} args* For util.format()
 */
LongCon.prototype.log = function(name, fn, nameColor, bodyColor) {
  if (this.get('quiet')) { return; }
  var nameColorFn = nameColor ? getProp(clc, nameColor) : defColorFn;
  var namespace = this.get('namespace');
  var indent = '';

  var bodyColorFn;
  if (bodyColor === true) {
    bodyColorFn = nameColorFn;
  } else if (typeof bodyColor === 'string') {
    bodyColorFn = getProp(clc, bodyColor);
  } else {
    bodyColorFn = defColorFn;
  }

  // Apply trace levels to indentation if push() and pop() were used.
  var traceIndent = this.get('traceIndent');
  var laneCx = traceIndent.length;
  indent = (new Array(this.traceDepth + 1)).join(traceIndent);
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
 * Create a log() wrapper with fixed arguments.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {string} nameColorFn cli-color selection, ex. 'red.bold' or 'yellow'
 * @param {boolean|string} bodyColor
 *   {boolean} If true, match 'nameColor'.
 *   {string} Custom cli-color.
 * @return {function} Accepts util.format() arguments
 *   {function} push: Accepts same args. Pushes a trace level.
 *   {function} pop: Accepts same args. Pops a trace level.
 */
LongCon.prototype.create = function(name, fn, nameColor, bodyColor) {
  var self = this;
  function logger() {
    self.log.apply(self, [name, fn, nameColor, bodyColor].concat([].slice.call(arguments)));
  }
  logger.push = function longConPush() {
    logger.apply(self, arguments); self.traceDepth++;
  };
  logger.pop = function longConPop() {
    self.traceDepth--;
    if (arguments.length) { logger.apply(self, arguments); }
  };
  return logger;
};

/**
 * Wrap an object's methods to automatically push/pop for (sync) tracing.
 *
 * @param {string} name Uniquely identify the object
 * @param {object} obj
 * @param {function} Logger from create()
 * @param {regexp} filter Include matching key names
 * @param {regexp} omit Exclude matching key names
 */
LongCon.prototype.traceMethods = function(name, obj, logger, filter, omit) {
  var self = this;
  filter = filter || /.?/;
  omit = omit || /a^/;
  Object.keys(obj).forEach(function longConTraceMethodsIter(key) {
    if (typeof obj[key] !== 'function') { return; }
    if (!filter.test(key)) { return; }
    if (omit.test(key)) { return; }
    var orig = obj[key];
    obj[key] = function longConTraceMethodsWrapper() {
      logger.push(name + '#' + key);
      var res = orig.apply(this, arguments);
      logger.pop();
      return res;
    };
  });
};

function defColorFn(str) { return str; }
