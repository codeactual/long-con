module.exports = function(grunt) {
  'use strict';

  require('grunt-horde')
    .create(grunt)
    .demand('initConfig.projName', 'long-con')
    .demand('initConfig.instanceName', 'longCon')
    .demand('initConfig.klassName', 'LongCon')
    .loot('node-component-grunt')
    .attack();
};
