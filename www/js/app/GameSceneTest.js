define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        this._super(core, background, foreground);
        this.angle = 0;
    },
    
    addBox: function() {
        var angle = this.angle, container = this.core.container;
        var width = container.width(),
            height = container.height();
        var box = new Bullet({
            x: width / 2, y: height / 2,
            angle: angle, life: 300, speed: 3,
            image: "bullets/arrow.png"
        });
        this.angle = (this.angle + 16) % 360;
        this.add(box);
    },
    
    update: function(delta) {
        this._super(delta);
        for (var i=0; i<2; ++i) {
            this.addBox();
        }
        //this.camera.position.y -= delta * 50;
    }
});

return GameSceneTest;

});