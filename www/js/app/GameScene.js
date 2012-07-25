define(function(require) {

var THREE = require('lib/Three');
var GameState = require('./GameState');
var Entity = require('./Entity');

var GameScene = GameState.extend({
    init: function(core, background, foreground, camera, scene) {
        this._super(core, background, foreground);
        var width = this.core.container.width(), 
            height = this.core.container.height();
        this.scene = scene || new THREE.Scene();
        this.camera = camera ||  new THREE.PerspectiveCamera(60, width / height, 1, 5000);
        this.camera.position.z = 1300;
        this.scene.add( this.camera );
        this.gameArea = { x: 0, y: 0, width: 1320, height: 1515 };
        this.camera.position.x = 300 + this.gameArea.x + this.gameArea.width / 2;
        this.camera.position.y = this.gameArea.y + this.gameArea.height / 2 - 35;
        this.collisionTestStep = 1;
    },

    add: function(entity) {
        this._super(entity);
        if (entity.model) {
            this.scene.add(entity.model);
        }
    },

    update: function(delta) {
        this._super(delta);
        if (!(this.frame % this.collisionTestStep)) {
            this.checkCollision(delta);
        }
    },

    checkCollision: function(delta) {
        var entitiesByGrid = this.entitiesByGrid;
        for (var location in entitiesByGrid) {
            var entities = this.entitiesByGrid[location];
            for (var i=0, iMax = entities.length; i<iMax; ++i) {
                var e = entities[i];
                var constructor = e.constructor;
                if (constructor) {
                    for (var j=i; j<iMax; ++j) {
                        var e2 = entities[j];
                        if (!(e2 instanceof constructor) && e.collides && e.collides(e2)) {
                            e.emit('collision:' + e2.getType(), e, e2);
                            e2.emit('collision:' + e.getType(), e2, e);
                        }
                    }
                }
            }
        }
    },

    remove: function(entity) {
        this._super(entity);
        if (entity.model) {
            this.scene.remove(entity.model);
        }
    },
    
    render: function(renderer) {
        for (var i in this.entities) {
            var entity = this.entities[i];
            if (entity.model) {
                entity.model.visible = !entity.outOfBounds(0, -4);
            }
        }
        renderer.render( this.scene, this.camera );
    },
    
    onResized: function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
});

return GameScene;

});