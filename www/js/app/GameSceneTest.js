define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        this._super(core, background, foreground);
        this.boxes = [];
        this.angle = 0;
    },
    
    addBox: function() {
        var angle = this.angle, container = this.core.container;
        var width = container.width(),
            height = container.height();
        var box = new Bullet({
            x: width / 2, y: height / 2,
            angle: angle, life: 500, speed: 3,
            image: "bullets/arrow.png"
        });
        this.angle = (this.angle + 16) % 360;
        this.boxes.push(box);
        this.scene.add(box.model);
    },
    
    update: function(delta) {
        var scene = this.scene;
        var boxes = this.boxes;
        var deleteList = [];
        for (var i=0; i<2; ++i) {
            this.addBox();
        }
        boxes.forEach(function(box) {
            box.update(delta);
            if (!box.alive) {
                deleteList.push(box);
            }
        });
        deleteList.forEach(function(box) {
            boxes.splice(boxes.indexOf(box), 1);
        });
        //this.camera.position.y -= delta * 50;
    }
});

return GameSceneTest;

});