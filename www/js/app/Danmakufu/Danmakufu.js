if (typeof define !== 'function') { var define = (require('amdefine'))(module); }
define(function(require) {

var Globals = require('./Globals');
var ScriptEngine = require('./ScriptEngine');
var Translator = require('./Translator');

var Danmakufu = function(fileString) {
    var loc = window.location.pathname;
    var dir = loc.substring(loc.lastIndexOf('/'));

    this.globals = new Globals({ directory: dir });
    this.engine = new ScriptEngine(fileString, this.globals.getFunctionSymbols());
    this.translator = new Translator(this.engine.blocks);
};

Danmakufu.prototype = {
    execute: function() {
        var head = document.getElementsByTagName('head')[0],
        script = document.createElement('script');
        script.textContent = this.translator.result;
        head.appendChild(script);    
    }
};

Danmakufu.loadFile = function(path) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false);
    xmlHttp.send(null);
    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
        return new Danmakufu(xmlHttp.responseText);
    }
    return null;
};

return Danmakufu;

})