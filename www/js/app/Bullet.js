define(function(require) {

var THREE = require('lib/Three');
var Sprite = require('./Sprite');

var Bullet = Sprite.extend({
    init: function(options) {
        this._super(options);
        this.life = options.life || 100;
        this.time = 0;
        this.model.material.blending = THREE.AdditiveBlending;
    },
    
    dying: function() {
        var opacity = this.model.material.opacity - 0.01;
        if (opacity < 0) {
            this.alive = false;
        }
        this.model.material.opacity = opacity < 0 ? 0 : opacity;
    },
    
    update: function(delta) {
        if (this.alive) {
            ++this.time;
            if (this.time > this.life) {
                this.dying();
            }
            this._super(delta);
        }
    }
});

return Bullet;

});