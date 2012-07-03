define(function(require) {
    
var Entity = require('./Entity');
var InputMap = require('./InputMap');
var Input = require('./Input');
var THREE = require('lib/Three');
var BulletPattern = require('./BulletPattern');

var Player = Entity.extend({
    type: 'player',

    canCollide: true,

    init: function(options) {
        this._super(options);
        this.inputMap = new InputMap();
        this.on('collision:bullet:enemy', this.onHit);
    },

    set: function(options) {
        this._super(options);
        this.shots = options.shots || {};
        _.each(this.shots, function(shot, index) {
            if (typeof shot === 'function') {
                this.shots[index] = new BulletPattern({ update: shot });
            }
        }, this);
        this.defaultSpeed = options.speed || 8;
        this.focusSpeed = options.focusSpeed || this.defaultSpeed / 2;
        this.hitbox = this.getHitbox(10, 10);
    },

    getKey: function(mappedKey) {
        return this.inputMap.map[mappedKey];
    },

    isKeyPressed: function(mappedKey) {
        return Input.isKeyPressed(Input.keys[this.inputMap.map[mappedKey]]);
    },

    update: function(delta) {
        if (this.alive) {
            this.control(delta);
            this._super(delta);
            this.stayInBounds();
        }
    },

    onHit: function(player, other) {
        this.alive = false;
    },

    control: function(delta) {
        var up = this.isKeyPressed('Up'), 
            down = this.isKeyPressed('Down'), 
            left = this.isKeyPressed('Left'), 
            right = this.isKeyPressed('Right'),
            focus = this.isKeyPressed('Focus'),
            speed = focus ? this.focusSpeed : this.defaultSpeed,
            angle,
            shots = this.shots;
        this.isFocused = focus;
        for (var i in shots) {
            var shot = shots[i];
            shot.isEnabled = this.isKeyPressed(i);
            shot.update(delta, this, this.state);
        }
        this.xSpeed = 0;
        this.ySpeed = 0;
        if (up) {
            this.ySpeed = -speed;
        } else if (down) {
            this.ySpeed = speed;
        }
        if (left) {
            this.xSpeed = -speed;
        } else if (right) {
            this.xSpeed = speed;
        }
        if (up || down || left || right) {
            angle = Math.atan2(this.ySpeed, this.xSpeed);
            this.xSpeed = speed * Math.cos(angle);
            this.ySpeed = speed * Math.sin(angle);
        }
    }
});

return Player;

});