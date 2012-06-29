define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');
var Tasks = require('./Tasks');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        var that = this;
        this._super(core, background, foreground);
        this.angle = 0;
        this.add(new Tasks({ tasks: [ that.tasks.addCircle ] }));
    },

    tasks: {
        addCircle: function(delta, owner, state) {
            var size = state.getSize();
            state.entities.forEach(function(entity) {
                if (entity instanceof Bullet) {
                    entity.angle++;
                }
            });
            for (var i=0; i<2; ++i) {
                var angle = this.angle || 0;
                state.add(new Bullet({
                    x: size.width / 2, y: size.height / 2,
                    angle: angle, life: 250,
                    image: "bullets/arrow.png",
                    color: Math.floor(Math.random() * 16777216)
                }));
                this.angle = (angle + 16) % 360;
            }
            if (Math.floor(this.time) % 1000 === 999) {
                this.tasks.remove(this);
                this.tasks.add(state.tasks.addBullet);
            }
        },

        addBullet: function(delta, owner, state) {
            if (Date.now() % 8 === 0) {
                var size = state.getSize();
                state.add(new Bullet({
                    x: size.width / 2, y: size.height / 2,
                    angle: Math.random() * 360, life: 50,
                    speed: 3 + Math.random() * 10,
                    image: "bullets/arrow.png",
                    tasks: [ state.tasks.arrowTask ]
                }));
            }
        },

        arrowTask: function(delta, owner, state) {
            owner.angle++;
            if (owner.time > owner.life - 40 &&
                Math.floor(owner.time) % 2 === 0) {
                this.angle = this.angle ? this.angle + 16 : owner.angle;
                var angle = this.angle;
                state.add(new Bullet({
                    x: owner.x, y: owner.y,
                    angle: angle, life: 150,
                    image: 'bullets/circleredsm.png',
                    color: Math.floor(Math.random() * 16777216)
                }));
            }
        }
    },
    
    update: function(delta) {
        this._super(delta);
        //this.camera.position.y -= delta * 50;
    }
});

return GameSceneTest;

});