if (typeof define !== 'function') { var define = (require('amdefine'))(module); }
define(function(require) {
   
var Globals = function(options) {
    options = options || {};
    this.directory = options.directory || '.';

    this.functions = {
        'print': console.log.bind(console)
    };
};

Globals.prototype = {
    getFunctionSymbols: function() {
        return functionsToSymbols(this.functions);
    }
};

var functionsToSymbols = function(functions) {
    var arr = [];
    for (var i in functions) {
        if (functions.hasOwnProperty(i)) {
            arr.push({ name: i, func: functions[i] });
        }
    }
    return arr;
};

return Globals;

});