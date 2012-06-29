define(function(require) {

var THREE = require('lib/Three');
var geometry = new THREE.CubeGeometry( 10, 10, 10 );

var ImageMapCache = {
    images: {},
    
    load: function(file) {
        this.images[file] = this.images[file] || 
            THREE.ImageUtils.loadTexture(file);
        return this.images[file];
    }
};

var Sprite = Class.extend({
    init: function(options) {
        options = options || {};
        this.speed = options.speed || 5;
        this.angle = options.angle || 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.image = options.image;
        var map = ImageMapCache.load("img/" + this.image);
        this.model = options.model || new THREE.Sprite({
            color: parseInt(Math.random() * 16777216),
            map: map
        });
        this.alive = true;
    },
    
    update: function(delta) {
        var radianAngle = (this.angle + 270) * (Math.PI / 180);
        this.xSpeed = this.speed * Math.cos(radianAngle);
        this.ySpeed = this.speed * Math.sin(radianAngle);
        this.x += this.xSpeed * delta * 50;
        this.y += this.ySpeed * delta * 50;
        this.model.position.x = this.x;
        this.model.position.y = this.y;
        this.model.rotation = (Math.PI * 2) - radianAngle;
    }
});

return Sprite;

});