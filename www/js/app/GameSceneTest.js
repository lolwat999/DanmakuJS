define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');
var Player = require('./Player');
var Tasks = require('./Tasks');
var OverlayState = require('./OverlayState');
var Entity = require('./Entity');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        var that = this;
        this._super(core, background, foreground);
        this.angle = 0;
        this.add(new Player({
            x: that.gameArea.width / 2, y: 100,
            image: 'characters/marisa.png',
            scale: 2
        }))
        this.add(new Tasks({ tasks: [ that.tasks.addCircle ] }));
        this.foreground = new OverlayState(core);
        this.foreground.frame = new Entity({ x: 0, y: 0, image: 'frame.png' });
        this.foreground.add(this.foreground.frame);
    },

    tasks: {
        addCircle: function(delta, owner, state) {
            var area = state.gameArea;
            state.entities.forEach(function(entity) {
                if (entity instanceof Bullet) {
                    entity.angle++;
                }
            });
            for (var i=0; i<2; ++i) {
                var angle = this.angle || 0;
                state.add(new Bullet({
                    x: area.width / 2, y: area.height / 2,
                    angle: angle, life: 250,
                    image: 'bullets/arrow.png',
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
                var area = state.gameArea;
                state.add(new Bullet({
                    x: area.width / 2, y: area.height / 2,
                    angle: Math.random() * 360, life: 150,
                    speed: 3 + Math.random() * 10,
                    image: 'bullets/arrow.png',
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