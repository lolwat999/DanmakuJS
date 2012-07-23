if (typeof define !== 'function') { var define = (require('amdefine'))(module); }
define(function(require) {

var Parser = require('./Parser');

var ScriptEngine = function(source, functions) {
    this.source = source;
    this.mainBlock = { level: 0, kind: 'normal', codes: [], name: '__global__' };
    this.blocks = [ this.mainBlock ];

    try {
        this.parser = new Parser(this.mainBlock, this.blocks, source, functions);
        this.events = this.parser.events;
    } catch (error) {
        this.handleError(error);
    }
};

ScriptEngine.prototype = {
    getMessage: function(error) {
        var message =  'Error: ' + error.message;
        if (error.line !== undefined) {
            message += ' at line: ' + error.line;
        }
        if (error.at !== undefined) {
            message += ' token: ' + error.at;
        }
        return message;
    },

    handleError: function(error) {
        var message = this.getMessage(error);
        alert(message);
    },

    clear: function() {
        this.blocks.clear;
    }
};

return ScriptEngine;

});