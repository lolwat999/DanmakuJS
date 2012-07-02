define(function(require) {

var Input = require('./Input');

var InputMap = Class.extend({
    init: function(options) {
        if (!options) {
            options = this.defaultMap;
        }
        this.map = options;
    },

    defaultMap: {
        Shoot: 'KEY_Z',
        Bomb: 'KEY_X',
        Left: 'LEFT_ARROW',
        Right: 'RIGHT_ARROW',
        Up: 'UP_ARROW',
        Down: 'DOWN_ARROW',
        Focus: 'SHIFT'
    },

    isKeyPressed: function(mappedKey) {
        return Input.isKeyPressed(Input.keys[this.map[mappedKey]]);
    }
});

return InputMap;

});