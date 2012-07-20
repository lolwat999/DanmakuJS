define(function(require) {
    
var TokenKind = require('./TokenKind');

var Scanner = function(options) {
    options = options || {};
    var source = typeof options === 'string' ? options : options.source;
    this.currentLine = null;
    this.line = 0;
    this.current = 0;
    this.source = source;
    this.word = '';
    this.lines = source.split('\n');
    this.tokens = [];
    this.lines.forEach(function(line, index) {
        this.tokens[index] = line.split(/(\[.*?\]|".*?"|[$-\/:-?{-~!"^`\[\]#@]|\s+)/g).filter(function(word) {
            return word.match(/\S+/);
        });
    }, this);
    if (this.tokens.length) {
        this.currentLine = this.tokens[this.line];
    }
    this.word = '';
    this.next = null;
    this.advance();
};

Scanner.prototype = {
    advance: function() {
        var token;
        while (!token && this.currentLine) {
            token = this.currentLine[this.current];
            if (!token) {
                ++this.line;
                this.currentLine = this.tokens[this.line];
            }
        }
        if (token) {
            var next = null;
            for (var kind in TokenKind) {
                var type = TokenKind[kind];
                if ((type instanceof RegExp && token.match(type)) || type === token) {
                    next = kind;
                    this.word = token;
                    ++this.current;
                    break;
                }
            }
            this.next = next;
        }
    },

    clone: function() {
        return new Scanner(this);
    }
};

return Scanner;

});