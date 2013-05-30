module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('projName', 'long-con')
    .demand('instanceName', 'longCon')
    .demand('klassName', 'LongCon')
    .loot('node-component-grunt')
    .attack();
};
