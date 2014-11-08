/*eslint-env mocha*/
'use strict';
var fs = require('fs');
var path = require('path');
var files = {};
var noop = function(){};
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
var Unparam = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console),

    unused = new Unparam({
        trace:true,
        readFile:true,
        writeFile:fs.createWriteStream(path.join(__dirname,'report-object.json'))
    }),
    wtf,
    asdf;

describe('report',function(){
    it('should write report file to write stream when passed',function(done){
        unused(wtf,asdf);
        exits[0]();
        process.nextTick(function(){
            fs.readFile(path.join(__dirname,'report-object.json'),done);
        });
    });
});
