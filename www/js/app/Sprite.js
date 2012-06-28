define(function(require) {

var THREE = require('lib/Three');
var geometry = new THREE.CubeGeometry( 10, 10, 10 );

var Sprite = Class.extend({
    init: function(options) {
        options = options || {};
        this.speed = options.speed || 5;
        this.angle = options.angle || 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.x = options.x || 0;
        this.y = options.y || 0;
        var material = new THREE.MeshBasicMaterial({ 
            color: parseInt(Math.random() * 16777216), shading: THREE.FlatShading, overdraw: true 
        });
        this.model = options.model || new THREE.Mesh( geometry, material );
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
        this.model.rotation.z = this.angle;
    }
});

return Sprite;

});