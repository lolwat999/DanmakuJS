define(function(require) {

var DanmakufuGlobals = require('./DanmakufuGlobals');
var Scanner = require('./Scanner');

var DanmakufuInterpreter = Class.extend({
    init: function(fileString) {
        var loc = window.location.pathname;
        var dir = loc.substring(loc.lastIndexOf('/'));
        this.globals = new DanmakufuGlobals({
        	directory: dir
        });
        var scanner = new Scanner(fileString);
        /*fileString = fileString.replaceAll('let', 'var');
        _.each(replaceAllPairs, function(replacement, toReplace) {
            fileString = fileString.replaceAll(toReplace, replacement);
        });
        var objectTypes = [ 'script_enemy_main' ];
        this.objects = {};
        _.each(objectTypes, function(type) {
        	this.objects[type] = parseObject(fileString, type);
        }, this);
        this.comments = parseComments(fileString);
        if (!this.comments.player) {
        	this.comments.player = 'FREE';
        }*/
    },

    execute: function(javascriptString, closure) {
        closure = closure === undefined ? true : closure;
        var beginClosure = closure ? '(function() {' : '';
        var endClosure = closure ? '})();' : '';
        document.write('<script>' + beginClosure +
            javascriptString + endClosure + '</script>');
    }
});

var parseObject = function(fileString, objectName) {
    var block = getBlock(fileString, objectName);
    var location = block.startLocation;
    var object = { name: objectName, methods: {} };
    while (location !== -1) {
    	var startLocation = fileString.indexOf('@', location);
    	if (startLocation !== -1) {
	    	var endLocation = fileString.indexOf('{', startLocation);
	    	var methodName = fileString.substring(startLocation + 1, endLocation - 1);
	    	var methodBlock = getBlock(fileString, '@' + methodName, location);
	    	methodBlock.name = methodName;
	    	object.methods[methodName] = methodBlock;
	    	location = methodBlock.endLocation;
    	} else {
    		location = -1;
    	}
    };
    return object;
};

var parseComments = function(fileString) {
	var location = -1;
	var identifier = '#';
	var comments = {};
	do {
		location = fileString.indexOf(identifier, location + 1);
		if (location !== -1) {
			var endLocation = fileString.indexOf('\n', location);
        	var content = fileString.substring(location + 1, endLocation).trim();
        	var descLocation = content.indexOf('[') + 1;
        	var title = content;
        	var description = '';
        	if (descLocation) {
        		title = content.substring(0, descLocation - 1);
        		description = content.substring(descLocation, content.length - 1);
        	}
        	var comment = { startLocation: location, endLocation: endLocation, 
        		title: title, description: description };
        	if (description || title === 'TouhouDanmakufu') {
        		comments[title] = comment;
        	} else {
        		comments.uncategorized = comments.uncategorized || [];
        		comments.uncategorized.push(comment);
        	}
		}
	} while (location !== -1);
	return comments;
};

var addBlock = function(fileString, block, endLocation, depth, blocks) {
    if (block) {
        block.endLocation = endLocation;
        block.depth = depth;
        block.content = fileString.substring(block.startLocation + 1, block.endLocation).trim();
        if (block.content) {
            blocks.push(block);
        }
    }
};

var getBlocks = function(fileString, blockStart, blockEnd) {
    blockStart = blockStart || '{';
    blockEnd = blockEnd || '}';
    var blocks = [], root, depth = 0, scopeStack = [], 
        startLocation = 0, endLocation, block, location = 0;
    while(location !== -1) {
        endLocation = fileString.indexOf(blockEnd, location);
        startLocation = fileString.indexOf(blockStart, location);
        if (startLocation <= endLocation && startLocation !== -1) {
            location = startLocation;
            ++depth;
            scopeStack.push({ startLocation: startLocation, children: [] });
        } else {
            location = endLocation;
            --depth;
            addBlock(fileString, scopeStack.pop(), endLocation, depth, blocks);
        }
        if (location !== -1) {
            ++location;
            if (location > fileString.length) {
                location = -1;
            }
        }
    }
    blocks = _.sortBy(blocks, function(block) {
        return block.startLocation;
    });
    _.each(blocks, function(block, index) {
        var depth = block.depth;
        if (depth) {
            var parent;
            for (var i=index - 1; i>=0 && !parent; --i) {
                var block2 = blocks[i];
                if (block2.depth === block.depth - 1) {
                    parent = block2;
                    block.parent = parent;
                    parent.children.push(block);
                }
            }
        }
    });
    return blocks;
};

var getBlock = function(fileString, blockIdentifier, startLocation, blockStart, blockEnd) {
    blockStart = blockStart || '{';
    blockEnd = blockEnd || '}';
    startLocation = startLocation || 0;
    var block, root, depth = 0, scopeStack = [], 
        startLocation = fileString.indexOf(blockIdentifier, startLocation), 
        endLocation, location = startLocation;
    while(location !== -1) {
        endLocation = fileString.indexOf(blockEnd, location);
        startLocation = fileString.indexOf(blockStart, location);
        if (startLocation <= endLocation && startLocation !== -1) {
            location = startLocation;
            if (!depth) {
                block = { startLocation: startLocation };
            }
            ++depth;
        } else {
            location = endLocation;
            --depth;
        }
        if (location !== -1) {
            ++location;
            if (location > fileString.length) {
                location = -1;
            }
        }
        if (!depth) {
            block.endLocation = endLocation;
            block.content = fileString.substring(block.startLocation + 1, block.endLocation).trim();
            break;
        }
    }
    return block;
};

var replaceAllPairs = {
    'let': 'var'
};

DanmakufuInterpreter.loadFile = function(path) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', path, false);
    xmlHttp.send(null);
    if (xmlHttp.status === 200 || xmlHttp.status === 0) {
        return new DanmakufuInterpreter(xmlHttp.responseText);
    }
    return null;
};

return DanmakufuInterpreter;

})