/**
 * Create a console logger w/ formatting, timestamp, color, namespace
 *
 * Licensed under MIT.
 * Copyright (c) 2013 David Smith <https://github.com/codeactual/>
 */

/*jshint node:true*/
'use strict';

module.exports = {
  create: create,
  NodeConsole: NodeConsole,
  mixin: mixin,
  requireComponent: require, // For tests and to load other component-land files
  requireNative: null // Normally set by index.js
};

var clc; // cli-color
var sprintf;

var configurable = require('configurable.js');
var extend  = require('extend');
var tea = require('tea-properties');
var getProp = tea.get;
var setProp = tea.set;

function create() {
  return new NodeConsole();
}

function NodeConsole() {
  this.settings = {
    namespace: '',
    quiet: false,
    time: true,
    traceDepth: false,
    traceIndent: ' '
  };

  this.traceDepth = 0;

  var requireNative = module.exports.requireNative;
  clc = clc || requireNative('cli-color');
  sprintf = sprintf || requireNative('util').format;
}

configurable(NodeConsole.prototype);

/**
 * util.format() wrapper with timestamp and injected output function.
 * Respects --quiet. Applies color selection.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {string} color cli-color selection, ex. 'red.bold' or 'yellow'
 * @param {boolean} colorBody Apply color to log body in addition to name
 * @param {mixed} args* For util.format()
 */
NodeConsole.prototype.log = function(name, fn, color, colorBody) {
  if (this.get('quiet')) { return; }
  var colorFn = color ? getProp(clc, color) : defColorFn;
  var bodyColorFn = colorBody ? colorFn : defColorFn;
  var namespace = this.get('namespace');

  var traceIndent = '';
  if (this.get('traceDepth')) {
    traceIndent = (new Array(this.traceDepth)).join(this.get('traceIndent'));
  }

  var sections = [
    traceIndent,
    this.get('time') ? '[' + (new Date()).toUTCString() + ']' : '',
    namespace,
    name ? colorFn(name) : '',
    bodyColorFn(sprintf.apply(null, [].slice.call(arguments, 4)))
  ];
  fn(sections.join(' '));
};

/**
 * Create a log() wrapper with fixed arguments.
 *
 * @param {string} name Source logger's name, ex. 'stderr'
 * @param {function} fn Ex. console.log
 * @param {string} color cli-color selection, ex. 'red.bold' or 'yellow'
 * @param {boolean} colorBody Apply color to log body in addition to name
 * @return {function} Accepts util.format() arguments
 */
NodeConsole.prototype.create = function(name, fn, color, colorBody) {
  var self = this;

  function logger() {
    self.log.apply(self, [name, fn, color, colorBody].concat([].slice.call(arguments)));
  }
  function push() { logger.apply(self, arguments); self.traceDepth++; }
  function pop() { logger.apply(self, arguments); self.traceDepth--; }

  if (this.get('traceDepth')) {
    return {push: push, pop: pop};
  } else {
    return logger;
  }
};

/**
 * Mix the given function set into NodeConsole's prototype.
 *
 * @param {object} ext
 */
function mixin(ext) {
  extend(NodeConsole.prototype, ext);
}

function defColorFn(str) { return str; }
