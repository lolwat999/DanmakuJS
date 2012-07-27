define(function(require) {
   
var Globals = function(options) {
    options = options || {};
    var that = this;
    this.directory = options.directory || '.';

    var functions = {
        // Global Functions
        print: console.log.bind(console),

        alert: alert,

        rand: function(low, high) {
            low = low || 0;
            high = high || 1;
            return Math.random() * (high - low) - low;
        },

        rand_int: function(low, high) {
            low = low || 0;
            high = high || 1;
            return parseInt(Math.random() * (high - low) - low);
        },

        ToString: function(param) {
            return toString(param);
        },

        int: function(param) {
            return parseInt(param);
        },

        truncate: function(param) {
            return parseInt(param);
        },

        trunc: function(param) {
            return parseInt(param);
        },

        absolute: function(param) {
            return Math.abs(param);
        },

        length: function(arr) {
            return arr.length;
        },

        Collision_Obj_Obj: function(obj, obj2) {
            return obj.collides(obj2);
        },

        erase: function(arr, index) {
            arr.splice(index, 1);
        },

        GetCurrentScriptDirectory: function() {
            return that.directory;
        },

        // Image enums
        RED01: 0,
        BLUE01: 1,

        // Constants
        OBJ_SHOT: 'Bullet'
    };

    this.functions = functions;

    [ 'cos', 'sin', 'tan', 'acos', 'atan', 'atan2', 
      'asin', 'log', 'ceil', 'floor', 'round' ].forEach(function(f) {
        this.functions[f] = Math[f].bind(Math);
    }, this);
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