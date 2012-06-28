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
        var angle = this.angle;
        var box = new Bullet({
            angle: angle,
            life: 500,
            speed: 2
        });
        this.angle = (this.angle + 16) % 360;
        this.boxes.push(box);
        this.scene.add(box.model);
    },
    
    update: function(delta) {
        var scene = this.scene;
        var boxes = this.boxes;
        var deleteList = [];
        this.addBox();
        boxes.forEach(function(box) {
            box.update(delta);
            if (!box.alive) {
                deleteList.push(box);
            }
        });
        deleteList.forEach(function(box) {
            scene.remove(box.model);
            boxes.splice(boxes.indexOf(box), 1);
        });
        //this.camera.position.y -= delta * 50;
    }
});

return GameSceneTest;

});