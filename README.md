# unparam [![Build Status](https://travis-ci.org/gcochard/unparam.svg?branch=master)](https://travis-ci.org/gcochard/unparam) [![Coverage Status](https://coveralls.io/repos/gcochard/unparam/badge.png)](https://coveralls.io/r/gcochard/unparam)

Unused parameter module for node.js

## Usage
```js
var unused = require('unparam');

function(arg1,arg2){
    unused(arg1);
    do_something(arg2);
}
```
It's that easy!
 
 
## Advanced usage

If you want to track all of your unused parameters, set the `UNPARAM_TRACE` environment variable. This will turn on tracking of each call, and will generate a report with line numbers, filenames, columns, (optionally source lines) and a total count of unused parameters. If you want the actual call to unparam to show up in the report, set the `UNPARAM_READ_FILE` environment variable. If you don't want the report to write to stdout, set the `UNPARAM_WRITE_FILE` environment variable.
```bash
$ UNPARAM_TRACE=true UNPARAM_READ_FILE=true node app.js
{ '/path/to/file.js': 
   [ { column: 5,
       lineNumber: 6,
       filename: '/path/to/file.js' } ] }
$
```

```bash
$ UNPARAM_TRACE=true UNPARAM_READ_FILE=true UNPARAM_WRITE_FILE=report.json node app.js
$ cat report.json
]
   {"column":5,"lineNumber":6,"filename":"/Users/gcochard/unparam/test/function.js"}
]
$
```
 
## Super ultra advanced usage

If you want to have multiple reports or different types of behavior based on the file/module/etc, don't bother with environment variables. The function that `unparam` exports is also a constructor! Call it with `new` and pass in your options like so:
```javascript
var path = require('path')
var Unparam = require('unparam');
var unused1 = new Unparam({trace:true,readFile:true,writeFile:path.join(__dirname,'report1.json')});
var unused2 = new Unparam({trace:true,readFile:false,writeFile:path.join(__dirname,'report2.json')});

function(arg1,arg2,arg3){
    unused1(arg1);
    unused2(arg2);
    do_something(arg3);
}
```
