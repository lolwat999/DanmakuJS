define(function(require) {

var Scanner = require('./Scanner');

var Parser = function(mainBlock, blocks, source, functions) {
    functions = functions || [];

    this.frame = []; // A list of scopes
    this.comments = [];
    this.scanner = new Scanner({ source: source });
    this.events = {};
    this.frame.push({ kind: 'normal', scope: {}, name: mainBlock.name });
    this.blocks = blocks;

    for (var i=0, length=functions.length; i<length; ++i) {
        this.registerFunction(functions[i]);
    }

    this.scanCurrentScope(0, null, false);
    this.parseStatements(mainBlock);
};

Parser.prototype = {
    scanCurrentScope: function(level, args, addingResult) {
        var scanner = this.scanner.clone();
        var currentScope = this.frame[this.frame.length - 1];
        var current = 0;
        var variable = 0;
        var blocks = this.blocks;
        
        if (addingResult) {
            currentScope.result = {
                level: level,
                sub: null,
                variable: variable
            };
            ++variable;
        }

        if (args) {
            for (var i=0, length=args.length; i<length; ++i) {
                currentScope.scope[args[i]] = {
                    level: level,
                    sub: null,
                    variable: variable,
                    name: args[i]
                };
                ++variable;
            }
        }
        
        while (current >= 0 && scanner.next) {
            if (scanner.next === 'openBrace') {
                ++current;
                scanner.advance();
            } else if (scanner.next === 'closeBrace') {
                --current;
                scanner.advance();
            } else if (FunctionTypes[scanner.next]) {
                var type = scanner.next;
                scanner.advance();
                if (!current) {
                    if (currentScope.scope[scanner.word]) {
                        throw parserError(scanner, 'A routine is defined twice.');
                    }
                    var kind = (type === 'SUB' || type === 'at') ? 'sub' : 
                        (type === 'FUNCTION' ? 'function' : 'microthread');
                    var symbol = {
                        level: level,
                        sub: newBlock(blocks, level + 1, kind),
                        name: scanner.word,
                        func: null,
                        variable: -1
                    };
                    symbol.sub.name = scanner.word;
                    symbol.sub.func = null;
                    symbol.sub.arguments = 0;
                    currentScope.scope[scanner.word] = symbol;
                    scanner.advance();
                    if (kind !== 'sub' && scanner.next === 'openParen') {
                        scanner.advance();
                        while (scanner.next === 'word' || scanner.next === 'LET' || scanner.next === 'REAL') {
                            ++symbol.sub.arguments;
                            if (scanner.next === 'LET' || scanner.next === 'REAL') {
                                scanner.advance();
                            }
                            if (scanner.next === 'word') {
                                scanner.advance();
                            }
                            if (scanner.next !== 'comma') {
                                break;
                            }
                            scanner.advance();
                        }
                    }
                }
            } else if (VariableTypes[scanner.next]) {
                scanner.advance();
                if (!current) {
                    if (scanner.word === 'result') {
                        if (currentScope.scope[scanner.word]) {
                            throw parserError(scanner, "Variables with the same name are declared in the same scope");
                        }
                    }
                    currentScope.scope[scanner.word] = {
                        level: level,
                        sub: null,
                        variable: variable,
                        name: scanner.word
                    };
                    ++variable;
                    scanner.advance();
                }
            } else if (scanner.next === 'word') {
                var word = scanner.word;
                scanner.advance();
                if (scanner.next === 'openBrace' && !current) {
                    var symbol = {
                        level: level,
                        sub: newBlock(blocks, level + 1, 'namespace'),
                        name: word,
                        variable: -1
                    };
                    symbol.sub.name = word;
                    currentScope.scope[word] = symbol;
                }
            } else {
                scanner.advance();
            }
        }
    },

    registerFunction: function(func) {
        var blocks = this.blocks;
        var symbol = {
            level: 0,
            sub: newBlock(blocks, 0, 'function'),
            variable: -1
        };
        symbol.sub.arguments = func.arguments;
        symbol.sub.name= func.name;
        symbol.sub.func = func.func;
        this.frame[0].scope[func.name] = symbol;
    },

    search: function(name) {
        var symbol = null;
        for (var i = this.frame.length - 1; i >= 0 && !symbol; --i) {
            symbol = this.frame[i].scope[name];
        }
        return symbol;
    },

    searchResult: function(name) {
        for (var i = this.frame.length - 1; i >= 0 && !symbol; --i) {
            var scope = this.frame[i];
            var symbol = scope.result;
            if (symbol) {
                return symbol;
            }
            if (scope.kind === 'sub' || scope.kind === 'microthread') {
                return null;
            }
        }
        return null;
    },

    writeOperation: function(block, name, clauses) {
        var scanner = this.scanner;
        block.codes.push({
            line: scanner.line,
            clauses: clauses,
            type: 'operation',
            name: name
        });
    },

    parseParentheses: function(block) {
        var scanner = this.scanner;
        if (scanner.next !== 'openParen') {
            throw parserError(scanner, '\"(\" is required.');
        }
        scanner.advance();
        this.parseExpression(block);
        if (scanner.next !== 'closeParen') {
            throw parserError(scanner, '\")\" is required.');
        }
        scanner.advance();
    },

    parseClause: function(block) {
        var scanner = this.scanner;
        if (scanner.next === 'real') {
            block.codes.push({
                line: scanner.line,
                value: scanner.word,
                type: 'pushValue'
            });
            scanner.advance();
        } else if (scanner.next === 'string') {
            block.codes.push({
                line: scanner.line,
                value: scanner.word,
                type: 'pushValue'
            });
            scanner.advance();
        } else if (scanner.next === 'bool') {
            block.codes.push({
                line: scanner.line,
                value: scanner.word,
                type: 'pushValue'
            });
            scanner.advance();
        } else if (scanner.next === 'word') {
            var symbol = this.search(scanner.word);
            if (!symbol) {
                throw parserError(scanner, 'Symbol not found: ' + scanner.word);
            }
            scanner.advance();
            if (symbol.sub) {
                if (symbol.sub.kind !== 'function') {
                    throw parserError(scanner, 'Sub is not a function.');
                }
                var argc = this.parseArguments(block);
                if (symbol.sub.arguments !== undefined && argc !== symbol.sub.arguments) {
                    throw parserError(scanner, 'Mismatched arguments on: ' + symbol.sub.name);
                }
                block.codes.push({
                    line: scanner.line,
                    value: symbol.sub,
                    arguments: argc,
                    type: 'callAndPushResult'
                });
            } else {
                block.codes.push({
                    line: scanner.line,
                    level: symbol.level,
                    variable: symbol.name,
                    type: 'pushVariable'
                });
            }
        } else if (scanner.next === 'openBracket') {
            scanner.advance();
            block.codes.push({
                line: scanner.line,
                value: scanner.word,
                type: 'pushValue'
            });
            while (scanner.next !== 'closeBracket') {
                this.parseExpression(block);
                this.writeOperation(block, 'append', 2);
                if (scanner.next !== 'comma') {
                    break;
                }
                scanner.advance();
            }
            if (scanner.next !== 'closeBracket') {
                throw parserError(scanner, 'Mismatched brackets.');
            }
            scanner.advance();
        } else if (scanner.next === 'openAbs') {
            scanner.advance();
            this.parseExpression(block);
            this.writeOperation(block, 'absolute', 1);
            if (scanner.next !== 'closeAbs') {
                throw parserError(scanner, 'Mismatched absolute, \"|)\" is required.');
            }
        } else if (scanner.next === 'openParen') {
            this.parseParentheses(block);
        } else {
            throw parserError(scanner, 'This is not a valid expression term.');
        }
    },

    parsePrefix: function(block) {
        var scanner = this.scanner;
        if (scanner.next === 'plus') {
            scanner.advance();
            this.parsePrefix(block);
        } else if (scanner.next === 'minus') {
            scanner.advance();
            this.parsePrefix(block);
            this.writeOperation(block, 'negative', 1);
        } else if (scanner.next === 'exclamation') {
            scanner.advance();
            this.parsePrefix(block);
            this.writeOperation(block, 'not', 1);
        } else {
            this.parseSuffix(block);
        }
    },

    parseSuffix: function(block) {
        var scanner = this.scanner;
        this.parseClause(block);
        if (scanner.next === 'caret') {
            scanner.advance();
            this.parseSuffix(block);
            this.writeOperation(block, 'power', 2);
        } else {
            while (scanner.next === 'openBracket') {
                scanner.advance();
                if (scanner.next === 'range') {
                    scanner.advance();
                    this.parseExpression(block);
                    this.writeOperation(block, 'slice', 3);
                } else {
                    this.writeOperation(block, 'index', 2);
                }
                if (scanner.next !== 'closeBracket') {
                    throw parserError(scanner, 'Mismatched square brackets, \"]\" is required.');
                }
                scanner.advance();
            }
        }
    },

    parseProduct: function(block) {
        var scanner = this.scanner;
        this.parsePrefix(block);
        while (scanner.next === 'asterisk' || scanner.next === 'slash' || scanner.next === 'percent') {
            var operation = (scanner.next === 'asterisk') ? 'multiply' : 
                ((scanner.next === 'slash') ? 'divide' : 'remainder');
            scanner.advance();
            this.writeOperation(block, operation, 2);
        }
    },

    parseSum: function(block) {
        var scanner = this.scanner;
        this.parseProduct(block);
        while (scanner.next === 'tilde' || scanner.next === 'plus' || scanner.next === 'minus') {
            var operation = (scanner.next === 'tilde') ? 'concatenate' : 
                ((scanner.next === 'plus') ? 'add' : 'subtract');
            scanner.advance();
            this.parseProduct(block);
            this.writeOperation(block, operation, 2);
        }
    },

    parseComparison: function(block) {
        var scanner = this.scanner;
        this.parseSum(block);
        if (scanner.next === 'assign') {
            throw parserError(scanner, 'Did you mistake == for = ?');
        }
        if (ComparisonTypes[scanner.next]) {
            var type = scanner.next;
            scanner.advance();
            this.parseSum(block);
            this.writeOperation(block, type, 2);
        }
    },

    parseLogic: function(block) {
        var scanner = this.scanner;
        this.parseComparison(block);
        while (scanner.next === 'and' || scanner.next === 'or') {
            this.writeOperation(block, scanner.next, 2);
            scanner.advance();
            this.parseComparison(block);
        }
    },

    parseExpression: function(block) {
        this.parseLogic(block);
    },

    parseArguments: function(block) {
        var result = 0;
        var scanner = this.scanner;
        if (scanner.next == 'openParen') {
            scanner.advance();
            while (scanner.next !== 'closeParen') {
                ++result;
                this.parseExpression(block);
                if (scanner.next !== 'comma') {
                    break;
                }
                scanner.advance();
            }
            if (scanner.next !== 'closeParen') {
                throw parserError(scanner, 'Mismatched parentheses, \")\" is required.');
            }
            scanner.advance();
        }
        return result;
    },

    parseStatements: function(block) {
        var scanner = this.scanner;
        var blocks = this.blocks;
        for ( ; ; ) {
            var needSemicolon = true;
            if (scanner.next === 'word') {
                var symbol = this.search(scanner.word);
                if (!symbol) {
                    throw parserError(scanner, 'Symbol not found: ' + scanner.word);
                }
                scanner.advance();
                if (scanner.next === 'openBrace') {
                    this.parseBlock(symbol.sub);
                    needSemicolon = false;
                } else if (scanner.next === 'assign') {
                    scanner.advance();
                    this.parseExpression(block);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.name });
                } else if (scanner.next === 'openBracket') {
                    block.codes.push({ line: scanner.line, type: 'pushVariableWritable', 
                        level: symbol.level, variable: symbol.name });
                    scanner.advance();
                    this.parseExpression(block);
                    if (scanner.next !== 'closeBracket') {
                        throw parserError(scanner, 'Mismatched brackets, a \"]\" is required.');
                    }
                    scanner.advance();
                    this.writeOperation(block, 'index!', 2);
                    if (scanner.next !== 'assign') {
                        throw parserError(scanner, '...?');
                    }
                    block.codes.push({ line: scanner.line, type: 'assignWritable', 
                        level: symbol.level, variable: symbol.name });
                } else if (OperatorAssignTypes[scanner.next]) {
                    var type = scanner.next.substr(0, scanner.next.indexOf('Assign'));
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'pushVariable', 
                        level: symbol.level, variable: symbol.name });
                    this.parseExpression(block);
                    this.writeOperation(block, type, 2);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.name });
                } else if (scanner.next === 'inc' || scanner.next === 'dec') {
                    var type = scanner.next === 'inc' ? 'successor' : 'predecessor';
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'pushVariable', 
                        level: symbol.level, variable: symbol.name });
                    this.writeOperation(block, type, 1);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.name });

                } else {
                    if (!symbol.sub) {
                        throw parserError(scanner, '...?');
                    }
                    var argc = this.parseArguments(block);
                    if (symbol.sub.arguments !== undefined && argc !== symbol.sub.arguments) {
                        throw parserError(scanner, 'Wrong number of arguments: ' + symbol.sub.name);
                    }
                    block.codes.push({ line: scanner.line, type: 'call', 
                        value: symbol.sub, args: argc })
                }
            } else if (scanner.next === 'LET' || scanner.next === 'REAL') {
                scanner.advance();
                if (scanner.next !== 'word') {
                    throw parserError(scanner, 'Identifiers are required.');
                }
                var symbol = this.search(scanner.word);
                scanner.advance();
                if (scanner.next === 'assign') {
                    scanner.advance();
                    this.parseExpression(block);
                    block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.name });

                }
            } else if (scanner.next === 'LOCAL') {
                scanner.advance();
                this.parseInlineBlock(block, 'normal');
                needSemicolon = false;
            } else if (scanner.next === 'LOOP') {
                scanner.advance();
                if (scanner.next === 'openParen') {
                    this.parseParentheses(block);
                    var length = block.codes.length;
                    block.codes.push({ line: scanner.line, type: 'loopCount' });
                    this.parseInlineBlock(block, 'loop');
                    block.codes.push({ line: scanner.line, type: 'loopBack', length: length });
                    block.codes.push({ line: scanner.line, type: 'pop' });
                } else {
                    var length = block.codes.length;
                    this.parseInlineBlock(block, 'loop');
                    block.codes.push({ line: scanner.line, type: 'loopBack', length: length });
                }
                needSemicolon = false;
            } else if (scanner.next === 'TIMES') {
                scanner.advance();
                this.parseParentheses(block);
                var length = block.codes.length;
                if (scanner.next === 'LOOP') {
                    scanner.advance();
                }
                block.codes.push({ line: scanner.line, type: 'loopCount' });
                this.parseInlineBlock(block, 'loop');
                block.codes.push({ line: scanner.line, type: 'loopBack', length: length });
                block.codes.push({ line: scanner.line, type: 'pop' });
            } else if (scanner.next === 'WHILE') {
                scanner.advance();
                var length = block.codes.length;
                this.parseParentheses(block);
                if (scanner.next === 'LOOP') {
                    scanner.advance();
                }
                block.codes.push({ line: scanner.line, type: 'loopIf' });
                this.parseInlineBlock(block, 'loop');
                block.codes.push({ line: scanner.line, type: 'loopBack', length: length });
                needSemicolon = false;
            } else if (scanner.next === 'ASCENT' || scanner.next === 'DESCENT') {
                var back = (scanner.next === 'DESCENT');
                scanner.advance();
                if (scanner.next !== 'openParen') {
                    throw parserError(scanner, '\"(\" is required');
                }
                scanner.advance();
                if (scanner.next === 'LET' || scanner.next === 'REAL') {
                    scanner.advance();
                }
                if (scanner.next !== 'word') {
                    throw parserError(scanner, 'Identifier Expected');
                }
                var word = scanner.word;
                scanner.advance();
                if (scanner.next !== 'IN') {
                    throw parserError(scanner, 'must be in');
                }
                scanner.advance();
                this.parseExpression(block);
                if (scanner.next !== 'range') {
                    throw parserError(scanner, '\"..\" is required in ASCENT/DESCENT');
                }
                scanner.advance();
                this.parseExpression(block);
                if (scanner.next !== 'closeParen') {
                    throw parserError(scanner, '"\")\" is required"');
                }
                scanner.advance();
                if (scanner.next === 'LOOP') {
                    scanner.advance();
                }
                var length = block.codes.length;
                block.codes.push({ line: scanner.line, type: back ? 'loopDescent' : 'loopAscent' });
                var nextBlock = newBlock(blocks, block.level + 1, 'loop');
                var counter = [];
                counter.push(word);
                this.parseBlock(nextBlock, counter, false);
                needSemicolon = false;
            } else if (scanner.next === 'IF') {
                scanner.advance();
                this.parseParentheses(block);
                block.codes.push({ line: scanner.line, type: 'caseIfNot' });
                this.parseInlineBlock(block, 'normal');
                while (scanner.next === 'ELSE') {
                    scanner.advance();
                    if (scanner.next === 'IF') {
                        scanner.advance();
                        this.parseParentheses(block);
                        block.codes.push({ line: scanner.line, type: 'caseElseIf' });
                        this.parseInlineBlock(block, 'normal');
                    } else {
                        block.codes.push({ line: scanner.line, type: 'caseElse' });
                        this.parseInlineBlock(block, 'normal');
                        break;
                    }
                }
                block.codes.push({ line: scanner.line, type: 'caseEnd' });
                needSemicolon = false;
            } else if (scanner.next === 'ALTERNATIVE') {
                scanner.advance();
                this.parseParentheses(block);
                block.codes.push({ line: scanner.line, type: 'alternative' });
                while (scanner.next === 'CASE') {
                    scanner.advance();
                    if (scanner.next !== 'openParen') {
                        throw parserError(scanner, '\"(\" is needed');
                    }
                    do {
                        scanner.advance();
                        this.parseExpression(block);
                    } while (scanner.next === 'comma');
                    if (scanner.next !== 'closeParen') {
                        throw parserError(scanner, '\")\" is needed');
                    }
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'caseStatement' });
                    this.parseInlineBlock(block, 'caseBlock');
                }
                if (scanner.next === 'OTHERS') {
                    block.codes.push({ line: scanner.line, type: 'caseOthers' });
                    scanner.advance();
                    this.parseInlineBlock(block, 'caseBlock');
                }
                block.codes.push({ line: scanner.line, type: 'alternativeEnd' });
                needSemicolon = false;
            } else if (scanner.next === 'BREAK') {
                scanner.advance();
                block.codes.push({ line: scanner.line, type: 'breakLoop' });
            } else if (scanner.next === 'RETURN') {
                scanner.advance();
                if (scanner.next === 'invalid' || scanner.next === 'semicolon' || scanner.next === 'closeBrace') {
                    break;
                } else {
                    this.parseExpression(block);
                    var symbol = this.searchResult();
                    if (!symbol) {
                        throw parserError(scanner, 'Symbol does not exist?');
                    }
                    block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.name });
                }
                block.codes.push({ line: scanner.line, type: 'breakRoutine' });
            } else if (scanner.next === 'YIELD') {
                scanner.advance();
                block.codes.push({ line: scanner.line, type: 'yield' });
            } else if (FunctionTypes[scanner.next]) {
                var isEvent = scanner.next === 'at';
                scanner.advance();
                var symbol = this.search(scanner.word);
                if (isEvent) {
                    if (symbol.sub.level > 1 && block.kind !== 'namespace') {
                        throw parserError(scanner, '...?');
                    }
                    this.events[symbol.sub.name] = symbol.sub;
                }
                scanner.advance();
                var args = [];
                if (symbol.sub.kind !== 'sub') {
                    if (scanner.next === 'openParen') {
                        scanner.advance();
                        while (scanner.next === 'word' || scanner.next === 'LET' || scanner.next === 'REAL') {
                            if (scanner.next === 'LET' || scanner.next === 'REAL') {
                                scanner.advance();
                                if (scanner.next !== 'word') {
                                    throw parserError(scanner, 'Arguments are required.');
                                }
                            }
                            args.push(scanner.word);
                            scanner.advance();
                            if (scanner.next !== 'comma') {
                                break;
                            }
                            scanner.advance();
                        }
                        if (scanner.next !== 'closeParen') {
                            throw new Error ('\")\" is required.');
                        }
                        scanner.advance();
                    }
                } else {
                    if (scanner.next === 'openParen') {
                        scanner.advance();
                        if (scanner.next !== 'closeParen') {
                            throw new Error ('\")\" is required.');
                        }
                        scanner.advance();
                    }
                }
                this.parseBlock(symbol.sub, args, symbol.sub.kind === 'function');
                needSemicolon = false;
            } else if (scanner.next === 'comment') {
                this.comments.push({ line: scanner.line, description: scanner.word });
                scanner.advance();
                needSemicolon = false;
            }
            if (needSemicolon && scanner.next !== 'semicolon') {
                break;
            }
            if (scanner.next === 'semicolon') {
                scanner.advance();
            }
        };
    },

    parseInlineBlock: function(block, blockKind) {
        var scanner = this.scanner;
        var block = newBlock(this.blocks, block.level + 1, blockKind);
        this.parseBlock(block, null, false);
        block.codes.push({ line: scanner.line, type: 'call', block: block, length: 0 });
    },

    parseBlock: function(block, args, addingResult) {
        var scanner = this.scanner;
        if (scanner.next !== 'openBrace') {
            throw parserError(scanner, '\"{\" is required.');
        }
        scanner.advance();
        this.frame.push({ kind: block.kind, scope: {}, name: block.name });
        this.scanCurrentScope(block.level, args, addingResult);
        if (args) {
            for (var i=0, length=args.length; i<length; ++i) {
                var symbol = this.search(args[i]);
                block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.name });
            }
        }
        this.parseStatements(block);
        this.frame.pop();
        if (scanner.next !== 'closeBrace') {
            throw parserError(scanner, '\"}\" is required.');
        }
        scanner.advance();
    }
};

var parserError = function(scanner, description) {
    console.trace();
    return {
        line: scanner.line,
        message: description,
        at: scanner.word
    };
};

var newBlock = function(blocks, level, kind) {
    var block = { level: level, kind: kind, codes: [] };
    blocks.push(block);
    return block;
};

var FunctionTypes = {
    'at': true,
    'SUB': true,
    'FUNCTION': true,
    'TASK': true
};

var VariableTypes = {
    'REAL': true,
    'LET': true,
    'VAR': true
};

var ComparisonTypes = {
    'greater': true,
    'less': true,
    'greaterEqual': true,
    'lessEqual': true,
    'notEqual': true,
    'equal': true
};

var OperatorAssignTypes = {
    'addAssign': true,
    'subtractAssign': true,
    'multiplyAssign': true,
    'divideAssign': true,
    'remainderAssign': true,
    'powerAssign': true
};

return Parser;

});