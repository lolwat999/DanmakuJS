define(function(require) {
    
var Entity = require('./Entity');
var InputMap = require('./InputMap');
var Input = require('./Input');
var THREE = require('lib/Three');

var Enemy = Entity.extend({
    type: 'enemy',

    canCollide: true,

    init: function(options) {
        this._super(options);
        this.on('collision:bullet:player', this.onHit);
    },

    onHit: function(enemy, other) {
        this.alive = false;
    },

    update: function(delta) {
        this._super(delta);
        if (this.outOfBounds(200)) {
            this.alive = false;
        }
    }
});

return Enemy;

});