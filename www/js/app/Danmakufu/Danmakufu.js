define(function(require) {

var Globals = require('./Globals');
var ScriptEngine = require('./ScriptEngine');
var Translator = require('./Translator');

var Danmakufu = function(fileString, filename, functions) {
    var newFunctions = {};
    var loc = window.location.pathname;
    var dir = loc.substring(loc.lastIndexOf('/'));

    this.filename = filename;
    fileString = this.addIncludes(fileString);

    this.globals = new Globals({ directory: dir });
    functions = extend([ this.globals.functions, functions ]);
    this.engine = new ScriptEngine(fileString, this.globals.toSymbols(functions));
    this.translator = new Translator(this.engine.blocks, filename, this.engine.parser.comments);
};

Danmakufu.prototype = {
    execute: function(onload) {
        var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
        script.type = "application/javascript;version=1.8";
        script.textContent = this.translator.result;
        head.appendChild(script);
        require([ 'danmakufu/' + this.filename ], function(module) {
            onload(module);
        });
    },

    addIncludes: function(fileString) {
        var lines = fileString.split('\n');
        _.each(lines, function(line, lineNumber) {
            var titleID = '#include_function';
            var location = line.indexOf(titleID);
            if (location !== -1) {
                var startLocation = line.indexOf('"', location + 1), 
                    endLocation = line.indexOf('"', startLocation + 1);
                if (startLocation !== -1 && endLocation !== -1) {
                    var path = line.substring(startLocation + 1, endLocation).trim();
                    lines[lineNumber] = getFile(path);
                }
            }
        }, this);
        return lines.join('\n');
    }
};

Danmakufu.loadFile = function(path, functions) {
    var response = getFile(path);
    if (response) {
        var dotIndex = path.lastIndexOf('.');
        if (dotIndex === -1) {
            dotIndex = path.length;
        }
        return new Danmakufu(response, path.substr(0, dotIndex), functions);
    }
    return null;
};

var getFile = function(path) {
    var xmlHttp = new XMLHttpRequest();
    var response = '';
    xmlHttp.open('GET', path, false);
    xmlHttp.send(null);
    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
        response = xmlHttp.responseText;
    }
    return response;
};

var extend = function(objects) {
    var newObj = {};
    objects.forEach(function(object) {
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                newObj[i] = object[i];
            }
        }
    });
    return newObj;
};

return Danmakufu;

})