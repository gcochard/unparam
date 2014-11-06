/**
 * @module unparam
 */
'use strict';
/*eslint-disable no-caller*/
module.exports = function(fs,path,files,noop,util,Transform,Writable,proc,cons){

    // Global declarations for these, they can get set globally every time in case something gets messed up
    var unparamReadFile, writeStream;
    /**
     * Transform stream to write a json array.
     * @constructor
     * @param {WritableStream} actualWriteStream - The underlying writable stream
     * @param {object} options - The other options
     * @returns {JsonWriter} An instance of JsonWriter
     */
    function JsonWriter(actualWriteStream,options){
        this._dest = actualWriteStream;
        this._start = '[\n    ';
        Transform.call(this,options);
        this._writableState.objectMode = true;
        this._readableState.objectMode = false;
    }
    util.inherits(JsonWriter,Transform);
    JsonWriter.prototype._transform = function(chunk,encoding,callback){
        // We don't need no fancy ifs!
        // Just redefine the _start after we write, idempotence is great!
        this._dest.write(this._start+JSON.stringify(chunk));
        this._start = ',\n    ';
        callback();
    };
    /**
     * The unparam object. If called without new, it will behave as if its unparam function had been called.
     * @constructor
     * @param {object} options The options object
     * @param {boolean} options.trace Whether to turn on tracing
     * @param {boolean} options.readFiles Whether to read the source files and grab the line of the calls
     * @param {string|Writable} options.writeFile The filename to write with the report, or a writable stream
     * @returns {Unparam#unparam} This instance's unparam reporter function
     */
    function Unparam(options){

        // Guard against dereferencing a null object
        options = options || {};
        // DANGER: Don't use `this` before we check if we are instanceof Unparam
        unparamReadFile = options.readFiles || proc.env.UNPARAM_READ_FILES;
        var actualWriteStream;
        var unparamWriteFile = options.writeFile || proc.env.UNPARAM_WRITE_FILE;
        if(unparamWriteFile){
            // Open in append mode so we can write to it properly on exit
            if(typeof unparamWriteFile === 'string'){
                actualWriteStream = fs.createWriteStream(path.resolve(__dirname,unparamWriteFile));
            } else if(unparamWriteFile instanceof Writable){
                actualWriteStream = unparamWriteFile;
            } else {
                // Do nothing
                return noop;
            }
            writeStream = new JsonWriter(actualWriteStream);
            actualWriteStream.on('open',function(fd){
                proc.once('exit',function(){

                    // REALLY terrible hack because we can't write to the stream
                    // at this point, but there's no way to hook sooner because
                    // we need to capture all calls to unparam until the end of the
                    // process execution. Must writeSync to get the proper json
                    // output in the file. We can assume that since this is on process
                    // exit event, the buffers have been flushed and the file is safe
                    // to write, especially since the event loop is dead. Once node v0.12
                    // comes out, we should be able to hook process.on('beforeExit')

                    /*eslint-disable no-sync*/
                    fs.writeSync(fd,'\n]\n');
                    /*eslint-enable no-sync*/
                });
            });
        } else {
            writeStream = {write:noop};
        }
        if(!(this instanceof Unparam)){
            if(!proc.env.UNPARAM_TRACE){
                return noop();
            }
            // Use legacy behavior because they did not make a new Unparam instance
            var opts = {callStackDepth:2,trace:true,readFiles:unparamReadFile,writeStream:writeStream};
            var up = new Unparam(opts);
            return up();
        }
        if(!proc.env.UNPARAM_TRACE && !options.trace){
            // Don't do anything, use legacy behavior
            return noop;
        }
        proc.env.UNPARAM_TRACE = proc.env.UNPARAM_TRACE || options.trace;
        this.trace = options.trace;
        this.readFiles = options.readFiles;
        this.writeStream = options.writeStream || writeStream;
        // callStackDepth will never be 0, so we can safely use || here
        this.callStackDepth = options.callStackDepth || 1;
        return this.unparam.bind(this);
    }
    /**
     * Prepares and captures a stack trace, which will give the line number, filename, column, and optionally the actual source code
     * @returns {void}
     */
    Unparam.prototype.unparam = function(){
        var obj;
        unparamReadFile = this.readFiles;
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_,stack){ return stack; };
        try{
            throw new Error();
        } catch(e){
            var stack = e.stack;
            var call = stack[this.callStackDepth];
            var lineNum = call.getLineNumber();
            var filename = call.getFileName();
            var column = call.getColumnNumber();
            var line = '';
            obj = {column:column,lineNumber:lineNum,filename:filename};
            if(unparamReadFile){
                /*eslint-disable no-sync*/
                var sourcelines = fs.readFileSync(filename,'utf8');
                /*eslint-enable no-sync*/
                line = sourcelines.split('\n')[lineNum-1].slice(column-1);
                obj.call = line;
            }
            files[filename] = files[filename] || [];
            files[filename].push(obj);
        }
        Error.prepareStackTrace = orig;
        this.writeStream.write(obj);
    };
    proc.once('exit',function(){
        /*istanbul ignore else: don't need to cover noops*/
        if(proc.env.UNPARAM_TRACE && !proc.env.UNPARAM_WRITE_FILE){
            cons.dir(files);
        }
    });
    return Unparam;
};
