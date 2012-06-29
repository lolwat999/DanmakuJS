define(function(require) {

var THREE = require('lib/Three');
var GameState = require('./GameState');

var GameScene = GameState.extend({
    init: function(core, background, foreground, camera, scene) {
        this._super(core, background, foreground);
        var width = this.core.container.width(), 
            height = this.core.container.height();
        this.scene = scene || new THREE.Scene();
        this.camera = camera || new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 1000 );
        this.camera.position.z = 200;
        this.scene.add( this.camera );
        var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
        directionalLight.position.x = Math.random() - 0.5;
        directionalLight.position.y = Math.random() - 0.5;
        directionalLight.position.z = Math.random() - 0.5;
        directionalLight.position.normalize();
        this.scene.add( directionalLight );
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
        renderer.render( this.scene, this.camera );
    },
    
    onResized: function(width, height) {
        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();
    }
});

return GameScene;

});