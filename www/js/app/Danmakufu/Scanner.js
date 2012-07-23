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
            this.tokens[index] = line.split(/(".*?"|[$-\-:-?{-~!"^`\[\]#\\@]|[.]{2}|\s+)/g).filter(function(word) {
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
            var isOperator = OperatorTypes[token], isComparison = ComparisonTypes[token];
            if ((isOperator || isComparison) && this.current + 1 < this.currentLine.length) {
                var nextToken = this.currentLine[this.current + 1];
                if (nextToken === '=' || (isComparison && nextToken === token)) {
                    ++this.current;
                    token += nextToken;
                }
            }
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
                    if (kind === 'bool') {
                        token = JSON.parse(token);
                    }
                    this.word = token;
                    break;
                }
            }
            if (next === null) {
                console.log(token);
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

var ComparisonTypes = {
    '&': true,
    '|': true,
    '!': true,
    '=': true,
    '<': true,
    '>': true,
    // Not comparisons, but we need these to be double matched.
    '+': true,
    '-': true,
    '.': true
}

var OperatorTypes = {
    '+': true,
    '-': true,
    '/': true,
    '*': true,
    '~': true,
    '%': true
};

return Scanner;

});