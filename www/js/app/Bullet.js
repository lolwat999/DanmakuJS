define(function(require) {

var THREE = require('lib/Three');
var Entity = require('./Entity');

var Bullet = Entity.extend({
    init: function(options) {
        this.time = 0;
        this._super(options);
    },

    set: function(options) {
        this._super(options);
        this.life = options.life || 100;
        this.model.blending = options.blending || THREE.AdditiveBlending;
        this.speedType = options.speedType || Entity.speedTypes.POLAR;
        this.angleToRotation = options.angleToRotation || true;
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
    },
    
    update: function(delta) {
        if (this.alive) {
            this.time += delta / 0.016666;
            if (this.time > this.life) {
                this.dying();
            }
            this._super(delta);
        }
    }
});

return Bullet;

});