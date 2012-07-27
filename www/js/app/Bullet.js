define(function(require) {

var THREE = require('lib/Three');
var Entity = require('./Entity');

var Bullet = Entity.extend({
    type: 'bullet',

    canCollide: true,

    isBullet: true,

    init: function(options) {
        this.time = 0;
        this._super(options);
    },

    set: function(options) {
        options = options || {};
        this._super(options);
        this.life = options.life || 10000;
        this.blending = options.blending || THREE.AdditiveBlending;
        if (this.model) {
            this.model.blending = this.blending;
        }
        this.speedType = options.speedType || Entity.speedTypes.POLAR;
        this.angleToRotation = options.angleToRotation || true;
        this.owner = options.owner || null;
        this.angleOffset = options.angleOffset || 270;
        this.delay = options.delay || 0;
        if (this.model && this.delay > 0) {
            this.model.opacity = 0;
            this.canCollide = false;
        }
    },

    setImage: function(image, color) {
        image = imageTypes[image] || image;
        this._super(image, color);
    },

    expired: function() {
        return (this.time > this.life);
    },
    
    dying: function() {
        var opacity = this.model.opacity - 0.01;
        if (opacity < 0) {
            this.alive = false;
        }
        this.model.opacity = opacity < 0 ? 0 : opacity;
        this.disableTasks = true;
        this.canCollide = false;
    },
    
    update: function(delta) {
        if (this.outOfBounds(500)) {
            this.alive = false;
        }
        if (this.delay > 0) {
            --this.delay;
            this.canCollide = false;
            if (!this.delay && this.model) {
                this.model.opacity = 1;
                this.canCollide = true;
            }
        } else if (this.alive) {
            this.time += delta / 0.016666;
            if (this.time > this.life) {
                this.dying();
            }
            this._super(delta);
        }
    },

    collides: function(other) {
        if (other instanceof this.owner.constructor) {
            return false;
        }
        return this._super(other);
    },

    getType: function() {
        return this.owner && this.owner.type !== this.type ? 
            this.type + ':' + this.owner.type : this.type;
    }
});

var imageTypes = {
    0: 'bullets/circleredsm.png',
    1: 'bullets/circlebluesm.png',
};

for (var i=2; i<1000; ++i) {
    imageTypes[i] = imageTypes[0];
}

return Bullet;

});