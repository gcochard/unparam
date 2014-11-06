/*eslint-env mocha*/
'use strict';
var fs = require('fs');
var path = require('path');
var files = {};
var noops = 0;
var noop = function(){noops++;};
var util = require('util');
var Transform = require('stream').Transform;
var Writable = require('stream').Writable;
var exits = [];
var mock_evt = function(evt,cb){
    if(evt === 'exit'){
        exits.push(cb);
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
mock_process.env.UNPARAM_TRACE = false;
var Unparam = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console);

var unused = new Unparam({
        trace:false,
        readFile:false,
        writeFile:false
    }),
    wtf,
    asdf;


    unused(wtf,asdf);
