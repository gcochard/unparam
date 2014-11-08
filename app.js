'use strict';
/*eslint-disable no-caller*/
var fs = require('fs');
var path = require('path');
var files = {};
var noop = function(){};
var util = require('util');
var Transform = require('stream').Transform;
var Writable = require('stream').Writable;
var Unparam = require('./lib/unparam')(fs,path,files,noop,util,Transform,Writable,process,console);
module.exports = Unparam;
