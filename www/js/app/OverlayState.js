define(function(require) {

var THREE = require('lib/Three');
var GameState = require('./GameState');
var Entity = require('./Entity');

var OverlayState = GameState.extend({
    init: function(core, background, foreground, camera, scene) {
        this._super(core, background, foreground);
        var width = this.core.container.width(), 
            height = this.core.container.height();
        this.scene = scene || new THREE.Scene();
        this.camera = camera ||  new THREE.PerspectiveCamera(60, width / height, 1, 5000);
        this.camera.position.z = 640;
        this.scene.add( this.camera );
    },

    add: function(entity) {
        this._super(entity);
        if (entity.model) {
            this.scene.add(entity.model);
        }
    },

    remove: function(entity) {
        this._super(entity);
        if (entity.model) {
            this.scene.remove(entity.model);
        }
    },
    
    render: function(renderer) {
        renderer.autoClear = false;
        renderer.render( this.scene, this.camera );
        renderer.autoClear = true;
    },
    
    onResized: function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
});

return OverlayState;

});