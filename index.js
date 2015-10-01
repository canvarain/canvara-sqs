/**
 * Copyright(c) 2015, canvara Technologies Pvt. Ltd.
 */
'use strict';

/**
 * Main file for the module
 * @author      ritesh
 * @version     1.0.0
 */

/**
 * Module dependencies
 * @private
 */
var AWS = require('aws-sdk');
var async = require('async');
var errors = require('common-errors');
var _ = require('lodash');

/**
 * Constructor function
 * @param  {Object}      opts              queue options for this instance
 */
function CanvaraSqs(opts) {
  if(!opts || !opts.region) {
    throw new Error('Region is required');
  }
  this.options = opts;
  this.queues = {};
  this.sqs = new AWS.SQS({apiVersion: '2012-11-05', region: opts.region, sslEnabled: true});
}

/**
 * Setup the queues
 * If any queue doesn't exist than create the queue
 * After the iniitialization process callback function will be called with error in case there is any error
 * After successfull initilization only this module can be used
 *
 * @param  {Function}    callback          callback function
 */
CanvaraSqs.prototype.init = function(callback) {
  var _self = this;
  /**
   * Helper method to create a queue
   *
   * @param  {String}      name              name of the queue to create
   * @param  {Function}    callback          callback function
   * @private
   */
  var _createQueue = function(queue, callback) {
    var params = {
      QueueName: queue.name,
      Attributes: queue.attributes
    };
    _self.sqs.createQueue(params, function(err, data) {
      if(err) {
        return callback(err);
      }
      _self.queues[queue.name] = data.QueueUrl;
      callback();
    });
  };
  async.waterfall([
    function(cb) {
      async.map(_self.options.queues, _createQueue, cb);
    }
  ], callback);
};

/**
 * Do the cleanup
 * @param  {Function}    callback          callback function
 */
CanvaraSqs.prototype.destroy = function(callback) {
  var _self = this;

  /**
   * Deletes a queue
   * @param  {String}      queueUrl          the queue url to delete
   * @param  {Function}    callback          callback function
   * @private
   */
  var _deleteQueue = function(queueUrl, callback) {
    var params = {
      QueueUrl: queueUrl
    };
    _self.sqs.deleteQueue(params, callback);
  };

  async.waterfall([
    function(cb) {
      async.map(_.values(_self.queues), _deleteQueue, function() {
        this.options = {};
        this.queues = {};
        this.sqs = {};
        cb();
      });
    }
  ], callback);
};

/**
 * Send a message to sqs queue
 *
 * @param  {String}        QueueName         name of the queue to send the message
 * @param  {Object}        messageBody       the message body
 * @param  {object}        attrs             optional sqs#sendMessage MessageAttributes
 * @param  {Function}      callback          callback function
 */
CanvaraSqs.prototype.sendMessage = function(queueName, messageBody, attrs, callback) {
  var _self = this, params;

  if('function' === typeof attrs) {
    callback = attrs;
    params = {
      MessageBody: messageBody,
      QueueUrl: _self.queues[queueName]
    };
  } else {
    params = {
      MessageBody: messageBody,
      QueueUrl: _self.queues[queueName],
      MessageAttributes: attrs
    };
  }
  if(!_self.queues[queueName]) {
    return callback(new errors.ReferenceError('Cannot resolve a queue with name ' + queueName));
  }
  _self.sqs.sendMessage(params, callback);
};

// module exports
module.exports = CanvaraSqs;