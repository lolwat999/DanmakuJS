define(function(require) {

var THREE = require('lib/Three');
var EventEmitter = require('lib/eventemitter2');
var Tasks = require('./Tasks');

var Entity = Class.extend({
    family: 'entity',

    type: 'entity',

    init: function(options) {
        _.extend(this, new EventEmitter());
        if (options) {
            this.set(options);
        }
    },

    set: function(options) {
        options = options || {};
        this.speed = options.speed || 5;
        this.angle = options.angle || 0;
        this.xSpeed = options.xSpeed || 0;
        this.ySpeed = options.ySpeed || 0;
        this.x = options.x || 0;
        this.y = options.y || 0;
        if (options.image && !options.model) {
            this.setImage(options.image, options.color);
        } else if (options.model) {
            this.model = options.model;
        }
        this.alive = true;
        this.parent = options.parent || null;
        this.state = options.state || null;
        this.tasks = options.tasks ? new Tasks({ tasks: options.tasks }) : null;
        this.speedType = options.speedType || Entity.speedTypes.CARTESIAN;
        this.angleToRotation = options.angleToRotation || false;
        this.disableTasks = false;
        this.xScale = options.xScale || options.scale || 1;
        this.yScale = options.yScale || options.scale || 1;
        this.hitboxScale = options.hitboxScale || 1;
        this.angleOffset = options.angleOffset || 0;
        if (options.events) {
            for (var i in options.events) {
                if (options.events.hasOwnProperty(i)) {
                    this.on(i, options.events[i]);
                }
            }
        }
    },

    setImage: function(image, color) {
        this.image = image;
        var map = Entity.imageMapCache.load('img/' + this.image);
        this.model = new THREE.Sprite({
            color: color || this.color || 0xFFFFFF, map: map,
            useScreenCoordinates: false
        });
        var parentX = this.parent ? this.parent.x : 0;
        var parentY = this.parent ? this.parent.y : 0;
        this.model.position.x = this.x + parentX;
        this.model.position.y = this.y + parentY;
        var state = this.state;
        if (state) {
            state.remove(this);
            state.add(this);
        }
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
        var radianAngle = (this.angle + this.angleOffset) * (Math.PI / 180);
        var size = this.getSize();
        if (this.speedType === Entity.speedTypes.POLAR) {
            this.xSpeed = this.speed * Math.cos(radianAngle);
            this.ySpeed = this.speed * Math.sin(radianAngle);
        }
        this.x += this.xSpeed;
        this.y -= this.ySpeed;
        if (this.model) {
            this.model.rotation = (Math.PI * 2) - radianAngle;
            this.model.position.x = this.x + parentX;
            this.model.position.y = this.y + parentY;
            var ratio = this.model.map.image.width / this.model.map.image.height;
            this.model.scale.x = this.xScale * ratio;
            this.model.scale.y = this.yScale;
        }
        if (!this.disableTasks && this.tasks) {
            this.tasks.update(delta, this);
        }
    },

    getType: function() {
        return this.type;
    },

    getSize: function() {
        if (this.model) {
            var that = this;
            return { x: that.model.map.image.width * that.xScale,
                     y: that.model.map.image.height * that.yScale };
        }
        return { x: 0, y: 0 };
    },

    outOfBounds: function(distance, sizeFactor) {
        if (this.state && this.state.gameArea) {
            var bounds = this.state.gameArea;
            var size = this.getSize();
            var x = this.x, y = this.y;
            distance = distance || 0;
            sizeFactor = sizeFactor || 2;
            return ( 
                x + distance < bounds.x + size.x / sizeFactor || 
                y + distance < bounds.y + size.y / sizeFactor ||  
                x - distance > bounds.width + bounds.x + size.x / sizeFactor || 
                y - distance > bounds.height + bounds.y - size.y / sizeFactor 
            );
        }
        return false;
    },

    stayInBounds: function() {
        if (this.state && this.state.gameArea) {
            var x = this.x, y = this.y;
            var size = this.getSize();
            var bounds = this.state.gameArea;
            if (x < bounds.x + size.x) {
                this.x = bounds.x + size.x;
            } else if (x > bounds.width + bounds.x - size.x) {
                this.x = bounds.width + bounds.x - size.x;
            }
            if (y < bounds.y + size.y / 2) {
                this.y = bounds.y + size.y / 2;
            }  else if (y > bounds.height + bounds.y - size.y) {
                this.y = bounds.height + bounds.y - size.y;
            }
            if (this.model) {
                this.model.position.x = this.x;
                this.model.position.y = this.y;
            }
        }
    },

    getHitbox: function(width, height) {
        var size = this.getSize(), hitboxScale = this.hitboxScale;
        width = width || size.x * hitboxScale;
        height = height || size.y * hitboxScale;
        return { x: - width / 2, y: - height / 2, width: width, height: height };
    },

    collides: function(other) {
        if (other.canCollide) {
            var hitbox = this.hitbox || this.getHitbox();
            var otherHitbox = other.hitbox || other.getHitbox();
            var x = hitbox.x + this.x, 
                x2 = otherHitbox.x + other.x, 
                y = hitbox.y + this.y,  
                y2 = otherHitbox.y + other.y,
                right = x + hitbox.width, 
                right2 = x2 + otherHitbox.width, 
                bottom = y + hitbox.height,
                bottom2 = y2 + otherHitbox.height;
            return !(x > right2 ||y > bottom2 || right < x2 || bottom < y2);
        }
        return false;
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