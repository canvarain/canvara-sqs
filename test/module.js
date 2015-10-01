/**
 * Copyright(c) 2015, canvara Technologies Pvt. Ltd.
 */
/* jshint unused:false */
'use strict';

/**
 * Test script for module
 *
 * @author      ritesh
 * @version     1.0.0
 */
var request = require('supertest'),
  CanvaraSqs = require('../'), canvaraSqs,
  should = require('should'),
  region = 'ap-southeast-1',
  queues = require('./queues');

describe('<INSTANTIATION TEST>', function() {
  it('Should throw an error if region is not defined', function(done) {
    try {
      var sqs = new CanvaraSqs({});
    } catch(e) {
      should.exist(e);
      done();
    }
  });
  it('Should throw an error if opts is undefined', function(done) {
    try {
      var sqs = new CanvaraSqs();
    } catch(e) {
      should.exist(e);
      done();
    }
  });
  it('Should be instantiated successfully', function(done) {
    try {
      var sqs = new CanvaraSqs({region: region});
      done();
    } catch(e) {
      should.not.exist(e);
      done();
    }
  });
});

describe('<Module test>', function() {
  before(function(done) {
    this.timeout(0);
    // instantiate and initialize the module
    canvaraSqs = new CanvaraSqs({region: region, queues: queues});
    canvaraSqs.init(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('Should be able to successfully send a message', function(done) {
    this.timeout(0);
    canvaraSqs.sendMessage(queues[0].name, JSON.stringify({message: 'Hello world'}), function(err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data.MessageId);
      should.exist(data.MD5OfMessageBody);
      done();
    });
  });

  it('Should be able to successfully send a message with message attributes', function(done) {
    this.timeout(0);
    var attributes = {
      userid: {
        DataType: 'String',
        StringValue: 'adashidh23423j4'
      },
      expiration: {
        DataType: 'Number',
        StringValue: '98654345'
      }
    };
    canvaraSqs.sendMessage(queues[0].name, JSON.stringify({message: 'Hello world'}), attributes, function(err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data.MessageId);
      should.exist(data.MD5OfMessageBody);
      should.exist(data.MD5OfMessageAttributes);
      done();
    });
  });

  after(function(done) {
    this.timeout(0);
    canvaraSqs.destroy(function(err) {
      should.not.exist(err);
      done();
    });
  });
});