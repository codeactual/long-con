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

var configurable = require('configurable.js');
var extend  = require('extend');

function create() {
  return new NodeConsole();
}

function NodeConsole() {
  this.settings = {
  };
}

configurable(NodeConsole.prototype);

/**
 * Mix the given function set into NodeConsole's prototype.
 *
 * @param {object} ext
 */
function mixin(ext) {
  extend(NodeConsole.prototype);
}
