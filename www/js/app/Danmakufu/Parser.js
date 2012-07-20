define(function(require) {

var Parser = function(scriptEngine, scanner) {
    this.frame = []; // A list of scopes
    this.scanner = scanner;
    this.events = {};
    this.scriptEngine = scriptEngine;

    this.frame.push({ });

    try {
        this.scanCurrentScope(0, null, false);
        this.parseStatements(engine.mainBlock);
    } catch (error) {
        alert(error.message);
        console.trace();
    }
};

Parser.prototype = {
    scanCurrentScope: function(level, args, addingResult) {
        var scanner = this.scanner.clone();
        var currentScope = this.frame[this.frame.length - 1];
        var scriptEngine = this.scriptEngine;
        var current = 0;
        var variable = 0;
        
        if (addingResult) {
            currentScope.result = {
                level: level,
                sub: null,
                variable: variable
            };
            ++variable;
        }

        if (args) {
            for (var i=0, i<args.length; ++i) {
                currentScope[args[i]] = {
                    level: level,
                    sub: null,
                    variable: variable
                };
                ++variable;
            }
        }
        
        while (current >= 0 && scanner.next) {
            if (scanner.next === 'openParen') {
                ++current;
                scanner.advance();
            } else if (scanner.next === 'closeParen') {
                --current;
                scanner.advance();
            } else if (FunctionTypes[scanner.next]) {
                var type = scanner.next;
                scanner.advance();
                if (!current) {
                    if (currentScope[scanner.word]) {
                        throw new Error('A routine is defined twice.');
                    }
                    var kind = (type === 'sub' || type === 'at') ? 'sub' : 
                        (type === 'function' ? type : 'microthread');
                    var symbol = {
                        level: level,
                        sub: scriptEngine.newBlock(level + 1, kind),
                        name: scanner.word,
                        func: null,
                        variable: -1
                    };
                    currentScope[scanner.word] = symbol;
                    scanner.advance();
                    if (kind !== 'sub' &&  scanner.next === 'openParen') {
                        scanner.advance();
                        while (scanner.next === 'string', || scanner.next === 'LET' || scanner.next === 'REAL') {
                            ++symbol.sub.arguments;
                            if (scanner.next === 'LET' || scanner.next === 'REAL') {
                                scanner.advance();
                            }
                            if (scanner.next === 'string') {
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
                        if (currentScope[scanner.word]) {
                            throw new Error("Variables with the same name are declared in the same scope");
                        }
                    }
                    currenScope[scanner.word] = {
                        level: level,
                        sub: null,
                        variable: variable
                    };
                    ++variable;
                    scanner.advance();
                }
            } else {
                scanner.advance();
            }
        }
    },

    registerFunction: function(func) {
        var engine = this.scriptEngine;
        var symbol = {
            level: 0,
            sub: engine.newBlock(0, 'function'),
            variable: -1
        };
        symbol.sub.arguments = func.arguments;
        symbol.sub.name= func.name;
        symbol.sub.func = func.func;
        this.frame[0][func.name] = symbol;
    },

    search: function(name) {
        var symbol = null;
        for (var i = this.frame.length - 1; i >= 0 && !symbol; --i) {
            symbol = this.frame[i][name];
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
        var symbol = search(name);
        var scanner = this.scanner;
        if (symbol.sub.arguments !== clauses) {
            throw new Error('Mismatched arguments and clauses for: ' + name);
        }
        block.codes.push({
            line: scanner.line,
            sub: symbol.sub,
            clauses: clauses,
            type: 'callAndPushResult'
        });
    },

    parseParentheses: function(block) {
        var scanner = this.scanner;
        if (scanner.next !== 'openParen') {
            throw new Error('\"(\" is required.');
        }
        this.parseExpression(block);
        if (scanner.next !== 'closeParen') {
            throw new Error('\")\" is required.');
        }
        scanner.advance();
    },

    parseClause: function(block) {
        var scanner = this.scanner;
        if (scanner.next === 'real') {
            block.codes.push({
                line: scanner.line,
                value: parseFloat(scanner.word),
                type: 'pushValue'
            });
        } else if (scanner.next === 'string') {
            block.codes.push({
                line: scanner.line,
                value: scanner.word,
                type: 'pushValue'
            });
            scanner.advance();
        } else if (scanner.next === 'word') {
            var symbol = this.search(scanner.word);
            if (!symbol) {
                throw new Error('Symbol not found: ' + scanner.word);
            }
            scanner.advance();
            if (symbol.sub) {
                if (symbol.sub.kind !== 'function') {
                    throw new Error('Sub is not a function.');
                }
                var argc = this.parseArguments(block);
                if (argc !== symbol.sub.arguments) {
                    throw new Error('Mismatched arguments on: ' + symbol.sub.name);
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
                    variable: symbol.variable,
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
                throw new Error('Mismatched brackets.');
            }
            scanner.advance();
        } else if (scanner.next === 'openAbs') {
            scanner.advance();
            this.parseExpression(block);
            this.writeOperation(block, 'absolute', 1);
            if (scanner.next !== 'closeAbs') {
                throw new Error('Mismatched absolute, \"|)\" is required.');
            }
        } else if (scanner.next === 'openParen') {
            this.parseParentheses(block);
        } else {
            throw new Error('This is not a valid expression term.');
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
                    throw new Error('Mismatched square brackets, \"]\" is required.');
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
            throw new Error('Did you mistake == for = ?');
        }
        if (ComparisonTypes[scanner.next]) {
            var type = scanner.next;
            scanner.advance();
            this.parseSum(block);
            this.writeOperation(block, 'compare', 2);
            block.codes.push({
                line: scanner.line,
                type: type
            });
        }
    },

    parseLogic: function(block) {
        var scanner = this.scanner;
        this.parseComparison(block);
        while (scanner.next === 'and' || scanner.next === 'or') {
            var command = (scanner.next === 'and') ? 'ifNot' : 'if';
            scanner.advance();
            block.codes.push({ line: scanner.line, type: 'dup' });
            block.codes.push({ line: scanner.line, type: 'caseBegin' });
            block.codes.push({ line: scanner.line, type: 'command' });
            block.codes.push({ line: scanner.line, type: 'caseEnd' });
        }
    },

    parseExpression: function(block) {
        this.parseLogic(block);
    },

    parseArguments: function(block) {
        var result = 0;
        var scanner = this.scanner;
        scanner.advance();
        if (scanner.next == 'openParen') {
            ++result;
            scanner.advance();
            while (scanner.next !== 'closeParen') {
                this.parseExpression(block);
                if (scanner.next !== 'comma') {
                    break;
                }
                scanner.advance();
            }
            if (scanner.next !== 'closeParen') {
                throw new Error('Mismatched parentheses, \")\" is required.');
            }
            scanner.advance();
        }
        return result;
    },

    parseStatements: function(block) {
        var scanner = this.scanner;
        for ( ; ; ) {
            var needSemicolon = true;
            if (scanner.next === 'word') {
                var symbol = this.search(scanner.word);
                if (!symbol) {
                    throw new Error('Symbol not found: ' + scanner.word);
                }
                scanner.advance();
                if (scanner.next === 'assign') {
                    scanner.advance();
                    this.parseExpression(block);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.variable });
                } else if (scanner.next === 'openBracket') {
                    block.codes.push({ line: scanner.line, type: 'pushVariableWritable', 
                        level: symbol.level, variable: symbol.variable });
                    scanner.advance();
                    this.parseExpression(block);
                    if (scanner.next !== 'closeBracket') {
                        throw new Error('Mismatched brackets, a \"]\" is required.');
                    }
                    scanner.advance();
                    this.writeOperation(block, 'index!', 2);
                    if (scanner.next !== 'assign') {
                        throw new Error('...?');
                    }
                    block.codes.push({ line: scanner.line, type: 'assignWritable', 
                        level: symbol.level, variable: symbol.variable });
                } else if (OperatorAssignTypes[scanner.next]) {
                    var type = scanner.next.substr(0, scanner.next.indexOf('Assign'));
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'pushVariable', 
                        level: symbol.level, variable: symbol.variable });
                    this.parseExpression(block);
                    this.writeOperation(block, type, 2);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.variable });
                } else if (scanner.next === 'inc' || scanner.next === 'dec') {
                    var type = scanner.next === 'inc' ? 'successor' : 'predecessor';
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'pushVariable', 
                        level: symbol.level, variable: symbol.variable });
                    this.writeOperation(block, type, 1);
                    block.codes.push({ line: scanner.line, type: 'assign', 
                        level: symbol.level, variable: symbol.variable });

                } else {
                    if (!symbol.sub) {
                        throw new Error('...?');
                    }
                    int argc = this.parseArguments(block);
                    if (argc !== symbol.sub.arguments) {
                        throw new Error('Wrong number of arguments: ' + symbol.sub.name);
                    }
                    block.codes.push({ line: scanner.line, type: 'call', 
                        value: symbol.sub, args: argc })
                }
            } else if (scanner.next === 'LET' || scanner.next === 'REAL') {
                scanner.advance();
                if (scanner.next !== 'word') {
                    throw new Error('Identifiers are required.');
                }
                var symbol = this.search(scanner.word);
                scanner.advance();
                if (scanner.next === 'assign') {
                    scanner.advance();
                    this.parseExpression(block);
                    block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.variable });

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
                    throw new Error('\"(\" is required');
                }
                scanner.advance();
                if (scanner.next === 'LET' || scanner.next === 'REAL') {
                    scanner.advance();
                }
                if (scanner.next !== 'word') {
                    throw new Error('Identifier Expected');
                }
                var word = scanner.word;
                scanner.advance();
                if (scanner.next !== 'IN') {
                    throw new Error('must be in');
                }
                scanner.advance();
                this.parseExpression(block);
                if (scanner.next !== 'range') {
                    throw new Error('\"..\" is required in ASCENT/DESCENT');
                }
                scanner.advance();
                if (scanner.next !== 'closeParen') {
                    throw new Error('"\")\" is required"');
                }
                scanner.advance();
                if (scanner.next === 'LOOP') {
                    scanner.advance();
                }
                if (!back) {
                    block.codes.push({ line: scanner.line, type: 'swap' });
                }
                var length = block.codes.length;
                block.codes.push({ line: scanner.line, type: 'dup2' });
                this.writeOperation(block, 'compare', 2);
                block.codes.push({ line: scanner.line, type: back ? 'loopDescent' : 'loopAscent' });
                if (back) {
                    this.writeOperation(block, 'predecessor', 1);
                }
                var newBlock = this.scriptEngine.newBlock(block.level + 1, 'loop');
                var counter = [];
                counter.push(word);
                this.parseBlock(newBlock, counter, false);
                block.codes.push({ line: scanner.line, type: 'dup' });
                block.codes.push({ line: scanner.line, type: 'call', value: newBlock, length: 1 });
                if (!back) {
                    this.writeOperation(block, 'successor', 1);
                }
                block.codes.push({ line: scanner.line, type: 'loopBack', length: length });
                block.codes.push({ line: scanner.line, type: 'pop' });
                block.codes.push({ line: scanner.line, type: 'pop' });
                needSemicolon = false;
            } else if (scanner.next === 'IF') {
                scanner.advance();
                block.codes.push({ line: scanner.line, type: 'caseBegin' });
                this.parseParentheses(block);
                block.codes.push({ line: scanner.line, type: 'caseIfNot' });
                this.parseInlineBlock(block, 'normal');
                while (scanner.next === 'ELSE') {
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'caseNext' });
                    if (scanner.next === 'IF') {
                        scanner.advance();
                        this.parseParentheses(block);
                        block.codes.push({ line: scanner.line, type: 'caseIfNot' });
                        this.parseInlineBlock(block, 'normal');
                    } else {
                        this.parseInlineBlock(block, 'normal');
                        break;
                    }
                }
                block.codes.push({ line: scanner.line, type: 'caseEnd' });
                needSemicolon = false;
            } else if (scanner.next === 'ALTERNATIVE') {
                scanner.advance();
                this.parseParentheses(block);
                block.codes.push({ line: scanner.line, type: 'caseBegin' });
                while (scanner.next === 'CASE') {
                    scanner.advance();
                    if (scanner.next !== 'openParen') {
                        throw new Error('\"(\" is needed');
                    }
                    block.codes.push({ line: scanner.line, type: 'caseBegin' });
                    do {
                        scanner.advance();
                        block.codes.push({ line: scanner.line, type: 'dup' });
                        this.writeOperation(block, 'compare', 2);
                        block.codes.push({ line: scanner.line, type: 'compareE' });
                        block.codes.push({ line: scanner.line, type: 'dup' });
                        block.codes.push({ line: scanner.line, type: 'caseIf' });
                        block.codes.push({ line: scanner.line, type: 'pop' });
                    } while (scanner.next === 'comma');
                    if (scanner.next !== 'closeParen') {
                        throw new Error('\")\" is needed');
                    }
                    scanner.advance();
                    block.codes.push({ line: scanner.line, type: 'caseIfNot' });
                    block.codes.push({ line: scanner.line, type: 'pop' });
                    this.parseInlineBlock(block, 'normal');
                    block.codes.push({ line: scanner.line, type: 'caseNext' });
                    if (scanner.next === 'OTHERS') {
                        scanner.advance();
                        block.codes.push({ line: scanner.line, type: 'pop' });
                        this.parseInlineBlock(block, 'normal');
                    } else {
                        block.codes.push({ line: scanner.line, type: 'pop' });
                    }
                    block.codes.push({ line: scanner.line, type: 'caseEnd' });
                    needSemicolon = false;
                }
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
                        throw new Error('Symbol does not exist?');
                    }
                    block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.variable });
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
                    if (symbol.sub.level > 1) {
                        throw new Error('...?');
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
                                    throw new Error('Arguments are required.');
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
                    this.parseBlock(symbol.sub, args, symbol.sub.kind === 'function');
                }
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
        var block = this.scriptEngine.newBlock(block.level + 1, blockKind);
        this.parseBlock(block, null, false);
        block.codes.push({ line: scanner.line, type: 'call', block: block, length: 0 });
    },

    parseBlock: function(block, args, addingResult) {
        var scanner = this.scanner;
        if (scanner.next !== 'openBrace') {
            throw new Error('\"{\" is required.');
        }
        scanner.advance();
        this.frame.push({ kind: block.kind });
        this.scanCurrentScope(block.level, args, addingResult);
        if (args) {
            for (var i=0, length=args.length; i<length; ++i) {
                var symbol = this.search(args[i]);
                block.codes.push({ line: scanner.line, type: 'assign', level: symbol.level, variable: symbol.variable });
            }
        }
        this.parseStatements(block);
        this.frame.pop();
        if (scanner.next !== 'closeBrace') {
            throw new Error('\"}\" is required.');
        }
        scanner.advance();
    }
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