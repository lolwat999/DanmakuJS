define(function(require) {

var THREE = require('lib/Three');
var Sprite = require('./Sprite');

var Bullet = Sprite.extend({
    init: function(options) {
        this._super(options);
        this.life = options.life || 100;
        this.time = 0;
        this.model.blending = THREE.AdditiveBlending;
    },
    
    dying: function() {
        var opacity = this.model.opacity - 0.01;
        if (opacity < 0) {
            this.alive = false;
        }
        this.model.opacity = opacity < 0 ? 0 : opacity;
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