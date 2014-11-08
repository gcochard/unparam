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
    this.out += util.format.call(null,arguments)+'\n';
};
Mock_console.prototype.dir = function(obj){
    this.out += util.inspect(obj)+'\n';
};
Mock_console.prototype.error = function(){
    this.err += util.format.call(null,arguments)+'\n';
};
var mock_console = new Mock_console();
var mock_process = {on:mock_evt,once:mock_evt,env:{}};
var unused = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console),
    wtf,
    asdf;


describe('functional usage',function(){
    it('should be silent',function(done){
        unused(wtf,asdf);
        cbs.forEach(function(fn){
            fn();
        });
        assert.equal(mock_console.out,'');
        done();
    });
});
