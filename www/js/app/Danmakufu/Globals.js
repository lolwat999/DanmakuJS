define(function(require) {
   
var Globals = function(options) {
    options = options || {};
    this.directory = options.directory || '.';

    this.functions = {
        'print': console.log.bind(console),

        rand: function(low, high) {
            low = low || 0;
            high = high || 1;
            return Math.random() * (high - low) - low;
        },

        // Constants
        RED01: 'bullets/circleredsm.png',
        BLUE01: 'bullets/circlebluesm.png'
    };
};

Globals.prototype = {
    toSymbols: function(functions) {
        functions = functions || this.functions;
        return toSymbols(functions);
    }
};

var toSymbols = function(functions) {
    var arr = [];
    for (var i in functions) {
        if (functions.hasOwnProperty(i)) {
            var obj = { name: i };
            if (typeof functions[i] === 'function') {
                obj.func = functions[i];
            } else {
                obj.constant = functions[i];
            }
            arr.push(obj);
        }
    }
    return arr;
};

return Globals;

});