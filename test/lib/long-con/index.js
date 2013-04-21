var sinon = require('sinon');
var chai = require('chai');

var should = chai.should();
chai.Assertion.includeStack = true;
chai.use(require('sinon-chai'));

var nc = require('../../..');

var requireComponent = require('../../../lib/component/require');

require('sinon-doublist')(sinon, 'mocha');

describe('nc', function() {
  'use strict';

  describe('LongCon', function() {
    beforeEach(function() {
      this.nc = nc.create();
    });

    it('should do something', function() {
      console.log('\x1B[33m<---------- INCOMPLETE'); // TODO
    });
  });
});
