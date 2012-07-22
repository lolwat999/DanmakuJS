if (typeof define !== 'function') { var define = (require('amdefine'))(module); }
define(function(require) {

var global = this;
    
var Translator = function(blocks) {
    this.blocks = blocks;
    this.header = '(function() {\n';
    this.footer = '})();';
    global.danmakufuScripts = global.danmakufuScripts || {};
    global.danmakufuScripts.__functions__ = global.danmakufuScripts.__functions__ || {};
    this.functions = global.danmakufuScripts.__functions__;
    this.blocks.forEach(function(block) {
        if (block.kind === 'namespace') {
            this.footer = 'this.danmakufuScripts["' + block.name + '"]=' + block.name + ';\n' + this.footer;
        }
    }, this);
    this.result = this.header + this.addJSBlock(0) + this.footer;
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
            block.children = [];
            for (var i=index, length=this.blocks.length; i<length; ++i) {
                var childBlock = this.blocks[i];
                if (childBlock.level === block.level + 1 && !childBlock.parent) {
                    childBlock.parent = block;
                    block.children.push(childBlock);
                }
            }
            block.jsString = this.translateBlock(block);
        } else {        
            this.functions[block.name] = function() {
                block.func.apply(null, arguments);
            };
        }
        return block.jsString;
    },

    translateBlock: function(block) {
        var jsString = '';
        var after = false;
        while (block.codes.length) {
            var code = block.codes.pop();
            if (code) {
                var str = this.translateCode(block, code);
                if (str) {
                    var semicolon = code.noSemicolon ? ' ' : ';\n';
                    jsString = str + semicolon + jsString;
                }
            }
        }
        block.children.forEach(function(childBlock) {
            jsString += this.addJSBlock(childBlock);
        }, this);
        return this.blockStart(block) + jsString + this.blockEnd(block);
    },

    blockStart: function(block) {
        if (block.name === '__global__') {
            return '';
        } else if (block.kind === 'sub') {
            return 'this.' + block.name + ' = function() {\n';
        } else if (block.kind === 'normal') {
            return '{\n';
        } else {
            return 'function ' + block.name + '() {\n';
        }
    },

    blockEnd: function(block) {
        if (block.name === '__global__') {
            return '';
        } else if (block.kind === 'normal') {
            return '}\n';
        } else {
            return '};\n';
        }
    },

    translateCode: function(block, code) {
        return code && this[code.type] ? this[code.type](block, code) : '';
    },

    assign: function(block, code) {
        var key = code.variable;
        var next = block.codes.pop();
        return 'var ' + key + '=' + this.translateCode(block, next);
    },

    pushValue: function(block, code) {
        return code.value;
    },

    call: function(block, code) {
        if (code.value) {
            if (code.value.func) {
                this.functions[code.value.name] = function() {
                    code.value.func.apply(null, arguments);
                };
            }
            var args = [];
            var newCode = block.codes.pop();
            for (var i=0, length=code.args; i<length; ++i) {
                args.push(newCode.value !== undefined ? newCode.value : newCode.variable);
                newCode = block.codes.pop();
            }
            block.codes.push(newCode);
            return 'danmakufuScripts.__functions__["' + code.value.name + '"](' + args.join(',') + ')';
        }
        return '';
    },

    operation: function(block, code) {
        var values = [];
        for (var i=0, length=code.clauses; i<length; ++i) {
            var newCode = block.codes.pop();
            if (newCode.type === 'operation') {
                values.push(this.operation(block, newCode));
            } else {
                var value = newCode.value !== undefined ? newCode.value : newCode.variable;
                if (value !== undefined) {
                    values.push(value);
                } else {
                    block.codes.push(newCode);
                }
            }
        }
        return operations[code.name].apply(operations[code.name], values);
    },

    caseIfNot: function(block, code) {
        return this.ifStatement(block, code, 'if')
    },

    caseNext: function(block, code) {
        return this.ifStatement(block, code, 'else');
    },

    caseElseIf: function(block, code) {
        return this.ifStatement(block, code, 'else if');
    },

    ifStatement: function(block, code, type) {
        var bracketBegin = '', bracketEnd = '';
        code.noSemicolon = true;
        var next, str = '';
        if (type.indexOf('if') !== -1) {
            bracketBegin = '(';
            bracketEnd = ')';
        }
        do {
            next = block.codes.pop();
            if (next && next.type.indexOf('case') === -1) {
                str += this.translateCode(block, next);
            } else {
                block.codes.push(next);
            }
        } while (next && next.type.indexOf('case') === -1);
        return type + ' ' + bracketBegin + str + bracketEnd + this.addJSBlock(block.children.pop());
    }
};

var operations = {

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
    or: '||'
};

for (var i in operationsToStr) {
    (function(i) {
        operations[i] = function(right, left) {
            var str = operationsToStr[i];
            if (left !== undefined) {
                str = left + str;
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