define('Functions', function() {
    return {};
});

define(function(require) {

var Functions = require('Functions');
var JSBeautify = require('./beautify');
    
var Translator = function(blocks, filename, comments) {
    this.blocks = blocks;
    this.header = 'define(\'danmakufu/' + filename + '\', function(require) {\n' +
                  'var __functions__ = require(\'Functions\');\n' +
                  'var Container = {};\n' +
                  'Container.__comments__ = ' + JSON.stringify(comments) + ';\n';
    this.footer = 'return Container;\n});';
    this.variables = [];
    this.result = JSBeautify(this.header + this.addJSBlock(0) + this.footer, {
        indent_size: 2,
        keep_array_indentation: true
    });
    console.log(this.result);
};

Translator.prototype = {
    addJSBlock: function(block) {
        var index = block;
        if (typeof block === 'number') {
            block = this.blocks[index];
        } else {
            index = this.blocks.indexOf(block);
            if (index === -1) {
                return '';
            }
        }
        if (!block.func) {
            block = clone(block);
            block.codes = clone(block.codes);
            if (!block.children) {
                block.children = [];
                for (var i=index, length=this.blocks.length; i<length; ++i) {
                    var childBlock = this.blocks[i];
                    if (childBlock.level === block.level + 1 && !childBlock.parent) {
                        childBlock.parent = block;
                        block.children.push(childBlock);
                    }
                }
            }
            block.jsString = this.translateBlock(block);
        } else {        
            Functions[block.name] = function() {
                block.func.apply(null, arguments);
            };
        }
        return block.jsString;
    },

    translateBlock: function(block) {
        var jsString = '';
        var after = false;
        var start = this.blockStart(block), end = this.blockEnd(block);
        while (block.codes.length) {
            var code = block.codes.shift();
            if (code) {
                var str = this.translateCode(block, code);
                if (str) {
                    var semicolon = code.noSemicolon ? ' ' : ';\n';
                    jsString += str + semicolon;
                }
            }
        }
        block.children.forEach(function(childBlock) {
            jsString += this.addJSBlock(childBlock);
        }, this);
        return start + jsString + end;
    },

    blockStart: function(block) {
        var args = this.getArguments(block, block.args);
        var start = block.level === 1 ? 'Container.' + block.name + ' = ' : '';
        if (block.name === '__global__') {
            return '';
        } else if (block.kind === 'namespace' || (block.level === 1 && FunctionTypes[block.kind])) {
            if (FunctionTypes[block.kind]) {
                start = 'var ' + block.name + ' = ' + start;
            }
            return start + 'function(' + args + ') {\n';
        } else if (FunctionTypes[block.kind]) {
            if (block.parent.kind === 'namespace') {
                start = 'this.' + block.name + '=';
            }
            return 'var ' + block.name + '=' + start + ' function(' + args + ') {\n';
        } else if (block.kind === 'caseBlock') {
            return '\n';
        } else {
            return '{\n';
        }
    },

    getArguments: function(block, num) {
        if (num) {
            var args = [];
            for (var i=0; i<num; ++i) {
                var next = block.codes.shift();
                if (next && next.variable) {
                    args.push(next.variable);
                }
            }
            return args.join(',');
        }
        return '';
    },

    blockEnd: function(block) {
        if (block.name === '__global__') {
            return '';
        } else if (block.kind === 'normal') {
            return '}\n';
        } else if (block.kind === 'caseBlock') {
            return ' break;\n'
        } else if (block.kind === 'loop') {
            return '}\n';
        } else {
            return '};\n';
        }
    },

    translateCode: function(block, code) {
        return code && this[code.type] ? this[code.type](block, code) : '';
    },

    let: function(block, code) {
        code.noSemicolon = true;
        return 'var ';
    },

    assign: function(block, code) {
        block.variablesAssigned = block.variablesAssigned || {};
        block.variablesAssigned[code.variable] = true;
        return code.variable + '=' + this.variables.pop();
    },

    pushValue: function(block, code) {
        this.variables.push(code.value);
        return '';
    },

    pushVariable: function(block, code) {
        this.variables.push(code.variable);
        return '';
    },

    call: function(block, code) {
        if (code.value) {
            var functionCall = code.value.func ? '__functions__["' + code.value.name + '"]' : code.value.name;
            if (code.value.func) {
                Functions[code.value.name] = function() {
                    return code.value.func.apply(null, arguments);
                };
            }
            var args = [];
            var next;
            for (var i=0, length=code.args; i<length; ++i) {
                args.unshift(this.variables.pop());
            }
            return functionCall + '(' + args.join(',') + ')';
        }
        return '';
    },

    callAndPushResult: function(block, code) {
        code.noSemicolon = true;
        this.variables.push(this.call(block, code));
    },

    operation: function(block, code) {
        var values = [], i, length;
        for (i=0, length=code.clauses; i<length; ++i) {
            if (this.variables.length) {
                values.unshift(this.variables.pop());
            }
        }
        if (code.name === 'and' || code.name === 'or') {
            for (i=0, length=values.length; i<length; ++i) {
                this.variables.push(values[i]);
            }
            this.variables.push(operations[code.name]());
        } else {
            this.variables.push(operations[code.name].apply(operations[code.name], values));
            return '';
        }
    },

    caseIfNot: function(block, code) {
        return this.ifStatement(block, code, 'if')
    },

    caseElse: function(block, code) {
        return this.ifStatement(block, code, 'else');
    },

    caseElseIf: function(block, code) {
        return this.ifStatement(block, code, 'else if');
    },

    ifStatement: function(block, code, type) {
        var bracketBegin = '', bracketEnd = '';
        code.noSemicolon = true;
        var next, str = '';
        if (type !== 'else') {
            bracketBegin = '(';
            bracketEnd = ')';
        }
        if (type === 'case' || type === 'default') {
            bracketBegin = '';
            bracketEnd = ':';
        }
        do {
            next = block[0];
            if (next && next.type.indexOf('case') === -1) {
                block.codes.shift();
                str += this.translateCode(block, next);
            }
        } while (next && next.type.indexOf('case') === -1);
        str += this.variables.join(' ');
        this.variables = [];
        var childBlock = block.children.shift();
        return type + ' ' + bracketBegin + str + bracketEnd + this.addJSBlock(childBlock);
    },

    loopIf: function(block, code) {
        return this.ifStatement(block, code, 'while');
    },

    loopCount: function(block, code) {
        var count = this.variables.pop();
        return this.loopStatement(block, 0, count);
    },

    loopAscent: function(block, code) {
        var end = this.variables.pop();
        var start = this.variables.pop();
        return this.loopStatement(block, start, end, code.variable);
    },

    loopDescent: function(block, code) {
        var start = this.variables.pop();
        var end = this.variables.pop();
        return this.loopStatement(block, start - 1, end, code.variable, '--', '>=');
    },

    loopStatement: function(block, start, end, id, increment, compare) {
        increment = increment || '++';
        var childBlock = block.children.shift();
        compare = compare || '<';
        if (id) {
            childBlock.codes.shift();
        } else {
            id = '__i';
        }
        var declare = 'var ' + id + ' = ' + start ;
        return 'for (' + declare + '; ' + id + compare + end + '; ' + id + 
            increment + ')' + this.addJSBlock(childBlock);
    },

    alternative: function(block, code) {
        code.noSemicolon = true;
        return 'switch (' + this.variables.pop() + ') {\n';
    },

    alternativeEnd: function(block, code) {
        code.noSemicolon = true;
        return '}\n';
    },

    caseStatement: function(block, code) {
        code.noSemicolon = true;
        return this.ifStatement(block, code, 'case');
    },

    caseOthers: function(block, code) {
        code.noSemicolon = true;
        return this.ifStatement(block, code, 'default');
    },

    endIndex: function(block, code) {
        var str = this.variables.join(',');
        this.variables = [ '[ ' + str + ' ]' ];
        return '';
    }
};

var operations = {
    index: function(left, right) {
        return left + '[' + right + ']';
    }
};

var operationsToStr = {
    add: '+',
    concatenate: '+',
    subtract: '-',
    divide: '/',
    multiply: '*',
    remainder: '%',
    equal: '===',
    greater: '>',
    less: '<',
    not: '!',
    notEqual: '!==',
    greaterEqual: '>=',
    lessEqual: '<=',
    and: '&&',
    or: '||',
    successor: '++',
    predecessor: '--',
    append: ','
};

var FunctionTypes = {
    sub: 'true',
    function: 'true',
    microthread: 'true'
};

for (var i in operationsToStr) {
    (function(i) {
        operations[i] = function(left, right) {
            var str = operationsToStr[i];
            if (left !== undefined) {
                if (i === 'successor' || i === 'predecessor') {
                    str += left;
                } else {
                    str = left + str;
                }
            }
            if (right !== undefined) {
                str += right;
            }
            return str;
        };
    })(i);
}

var clone = function(obj) {
    var newObj = obj instanceof Array ? [] : {};
    for (var i in obj) {
        newObj[i] = obj[i];
    }
    return newObj;
}

return Translator;

});