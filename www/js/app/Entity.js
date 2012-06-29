define(function(require) {

var THREE = require('lib/Three');
var Tasks = require('./Tasks');

var Entity = Class.extend({
    init: function(options) {
        this.set(options)
    },

    set: function(options) {
        options = options || {};
        this.speed = options.speed || 5;
        this.angle = options.angle || 0;
        this.xSpeed = options.xSpeed || 0;
        this.ySpeed = options.ySpeed || 0;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.image = options.image;
        var map = Entity.imageMapCache.load("img/" + this.image);
        this.model = options.model || new THREE.Sprite({
            color: options.color || 0xFFFFFF, map: map
        });
        this.alive = true;
        this.parent = options.parent || null;
        this.state = options.state || null;
        this.tasks = options.tasks ? new Tasks({ tasks: options.tasks }) : null;
        this.speedType = options.speedType || Entity.speedTypes.CARTESIAN;
        this.angleToRotation = options.angleToRotation || false;
        this.disableTasks = false;
    },

    add: function(entity) {
        if (this.state) {
            entity.parent = entity.parent || this;
            this.state.add(entity);
        }
    },

    remove: function(entity) {
        if (this.state) {
            this.state.remove(entity);
        }
    },
    
    update: function(delta) {
        var parentX = this.parent ? this.parent.x : 0;
        var parentY = this.parent ? this.parent.y : 0;
        var radianAngle = (this.angle + 270) * (Math.PI / 180);
        if (this.speedType === Entity.speedTypes.POLAR) {
            this.xSpeed = this.speed * Math.cos(radianAngle);
            this.ySpeed = this.speed * Math.sin(radianAngle);
        }
        if (this.angleToRotation) {
            this.model.rotation = (Math.PI * 2) - radianAngle;
        }
        this.x += this.xSpeed * delta * 50;
        this.y += this.ySpeed * delta * 50;
        this.model.position.x = this.x + parentX;
        this.model.position.y = this.y + parentY;
        if (!this.disableTasks && this.tasks) {
            this.tasks.update(delta, this);
        }
    }
});

Entity.imageMapCache = {
    images: {},
    
    load: function(file) {
        this.images[file] = this.images[file] || 
            THREE.ImageUtils.loadTexture(file);
        return this.images[file];
    }
};

Entity.speedTypes = {
    POLAR: 0,
    CARTESIAN: 1
};


return Entity;

});