/*eslint-env mocha*/
'use strict';
var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var files = {};
var noop = function(){};
var util = require('util');
var Transform = require('stream').Transform;
var Writable = require('stream').Writable;
var exits = [];
var exitCount = 0;
var mock_evt = function(evt,cb){
    if(evt === 'exit'){
        exitCount++;
        exits.push(cb);
    }
};
var mock_once = function(evt,cb){
    if(evt === 'exit'){
        exitCount++;
        exits.push(_.once(cb));
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
var mock_process = {on:mock_evt,once:mock_once,env:{}};
var Unparam = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console),
    wtf,
    asdf;

describe('object usage',function(){
    it('should register process exit callback when required',function(){
        assert.equal(exits.length,1);
    });
    it('should work with options',function(done){
        var endproc;
        mock_process.once = function(evt,cb){
            assert.equal(evt,'exit');
            endproc = cb;
        };
        var Unparam1 = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console);
        var unused1 = new Unparam1({
            trace:true,
            readFile:true,
            writeFile:path.join(__dirname,'report-multi1.json')
        });
        unused1(wtf);
        assert(endproc instanceof Function);
        endproc();

        // Wait a suitable amount of time for the buffer to be flushed
        fs.readFile(path.join(__dirname,'report-multi1.json'),'utf-8',function(err,data){
            assert(data);
            done(err);
        });
    });
    it('should work with readFile false',function(done){
        var endproc;
        mock_process.once = function(evt,cb){
            assert.equal(evt,'exit');
            endproc = cb;
        };
        var Unparam2 = require('../lib/unparam')(fs,path,files,noop,util,Transform,Writable,mock_process,mock_console);
        var unused2 = new Unparam2({
            trace:true,
            readFile:false,
            writeFile:path.join(__dirname,'report-multi2.json')
        });
        unused2(asdf);
        assert(endproc instanceof Function);
        endproc();
        //assert.equal(exits.length,3);
        fs.readFile(path.join(__dirname,'report-multi2.json'),'utf8',function(err,data){
            assert(data);
            done(err);
        });
    });
});
