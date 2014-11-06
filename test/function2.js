/*eslint-env mocha*/
'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var files = {};
var noop = function(){};
var util = require('util');
var Transform = require('stream').Transform;
var Writable = require('stream').Writable;
var cbs = [];
var mock_evt = function(evt,cb){
    if(evt === 'exit'){
        cbs.push(cb);
    }
};
var Mock_console = function(){
    this.out = '';
    this.err = '';
};
Mock_console.prototype.log = function(){
    this.out += util.format(arguments);
};
Mock_console.prototype.dir = function(obj){
    this.out += util.inspect(obj);
};
Mock_console.prototype.error = function(){
    this.err += util.format(arguments);
};
var mock_console = new Mock_console();
var mock_process = {on:mock_evt,once:mock_evt,env:{}};
mock_process.env.UNPARAM_TRACE = true;
mock_process.env.UNPARAM_READ_FILES = true;
var unused = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console),
    wtf,
    asdf;

describe('environment vars',function(){
    it('should register process.exit cb when required',function(){
        assert.equal(cbs.length,1);
    });
    it('should write to stdout when UNPARAM_TRACE is set',function(done){
        unused(wtf,asdf);
        cbs.forEach(function(fn){
            fn();
        });
        assert(mock_console.out);
        done();
    });
});
