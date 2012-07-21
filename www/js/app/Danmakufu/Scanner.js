if (typeof define !== 'function') { var define = (require('amdefine'))(module); }
define(function(require) {
    
var TokenKind = require('./TokenKind');

var Scanner = function(options) {
    options = options || {};
    var source = typeof options === 'string' ? options : options.source;
    this.currentLine = null;
    this.line = options.line || 1;
    this.current = options.current || 0;
    this.source = source;
    this.word = options.word || '';
    this.lines = source.split('\n');
    this.tokens = options.tokens || [];
    if (!this.tokens.length) {
        this.lines.forEach(function(line, index) {
            this.tokens[index] = line.split(/(".*?"|[$-\/:-?{-~!"^`\[\]#@]|\s+)/g).filter(function(word) {
                return word.match(/\S+/);
            });
        }, this);
    }
    if (this.tokens.length) {
        this.currentLine = this.tokens[this.line - 1];
    }
    this.next = options.next || null;
    if (!this.current && this.line === 1) {
        this.advance();
    }
};

Scanner.prototype = {
    advance: function() {
        var token;
        while (!token && this.currentLine) {
            token = this.currentLine[this.current];
            if (!token) {
                ++this.line;
                this.current = 0;
                this.currentLine = this.tokens[this.line - 1];
            }
        }
        if (token) {
            var next = null;
            for (var kind in TokenKind) {
                var type = TokenKind[kind];
                if ((type instanceof RegExp && token.match(type)) || type === token || this.inComment) {
                    next = kind;
                    var lineNumber = this.line;
                    ++this.current;
                    if (kind === 'comment') {
                        token = '';
                        this.inComment = true;
                        while (this.current < this.currentLine.length) {
                            token += this.advance();
                        }
                        this.inComment = false;
                    }
                    if (kind === 'real') {
                        token = parseFloat(token);
                    }
                    this.word = token;
                    break;
                }
            }
            this.next = next;
        } else {
            this.next = '';
            this.word = null;
        }
        return this.word;
    },

    clone: function() {
        return new Scanner(this);
    }
};

return Scanner;

});