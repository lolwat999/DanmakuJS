define(function(require) {

var DanmakufuGlobals = require('./DanmakufuGlobals');
var ScriptEngine = require('./ScriptEngine');

var DanmakufuInterpreter = Class.extend({
    init: function(fileString) {
        var loc = window.location.pathname;
        var dir = loc.substring(loc.lastIndexOf('/'));
        this.globals = new DanmakufuGlobals({ directory: dir });

        var engine = new ScriptEngine(fileString, functionsToArray(functions));
        console.log(engine);
    },

    execute: function(javascriptString, closure) {
        closure = closure === undefined ? true : closure;
        var beginClosure = closure ? '(function() {' : '';
        var endClosure = closure ? '})();' : '';
        document.write('<script>' + beginClosure +
            javascriptString + endClosure + '</script>');
    }
});

var functions = [
    'print'
];

var functionsToArray = function(functions) {
    var arr = [];
    functions.forEach(function(name) {
        arr.push( { name: name });
    })
    return arr;
};

DanmakufuInterpreter.loadFile = function(path) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false);
    xmlHttp.send(null);
    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
        return new DanmakufuInterpreter(xmlHttp.responseText);
    }
    return null;
};

return DanmakufuInterpreter;

})