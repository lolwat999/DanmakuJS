define(function(require) {

var Globals = require('./Globals');
var ScriptEngine = require('./ScriptEngine');
var Translator = require('./Translator');

var Danmakufu = function(fileString, filename, functions) {
    var newFunctions = {};
    var loc = window.location.pathname;
    var dir = loc.substring(loc.lastIndexOf('/'));

    this.filename = filename;
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
    }
};

Danmakufu.loadFile = function(path, functions) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false);
    xmlHttp.send(null);
    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
        var dotIndex = path.lastIndexOf('.');
        if (dotIndex === -1) {
            dotIndex = path.length;
        }
        return new Danmakufu(xmlHttp.responseText, path.substr(0, dotIndex), functions);
    }
    return null;
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