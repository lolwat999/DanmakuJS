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
        this.on('collision:bullet', this.onHit);
        this.outOfBoundsKill = 200;
    },

    onHit: function(enemy, other) {
        enemy.alive = false;
    },

    update: function(delta) {
        this._super(delta);
        if (this.outOfBounds(this.outOfBoundsKill)) {
            this.alive = false;
        }
    }
});

return Enemy;

});