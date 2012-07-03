define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');
var BulletPattern = require('./BulletPattern');
var Player = require('./Player');
var Tasks = require('./Tasks');
var OverlayState = require('./OverlayState');
var Entity = require('./Entity');
var Enemy = require('./Enemy');
var PolarVector = require('./PolarVector');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        this._super(core, background, foreground);
        this.addPlayer();
        this.foreground = new OverlayState(core);
        this.foreground.uiFrame = new Entity({ x: 0, y: 0, image: 'frame.png' });
        this.foreground.add(this.foreground.uiFrame);
    },

    addPlayer: function() {
        var that = this;
        this.add(new Player({
            x: that.gameArea.width / 2, 
            y: 100,
            image: 'characters/marisa.png',
            scale: 2.5,
            shots: {
                Shoot: shotType
            }
        }));
    },

    addEnemy: function(delta) {
        var state = this;
        if (!(state.frame % 20)) {
            this.add(new Enemy({
                x: Math.random() * state.gameArea.width,
                y: state.gameArea.height,
                xSpeed: -(Math.random() * 10) + 5,
                ySpeed: 5,
                scale: 2.5,
                angle: 180,
                image: 'characters/marisa.png',
                tasks: [ addCircle ]
            }));
        }
    },
    
    update: function(delta) {
        this._super(delta);
        this.addEnemy(delta);
    }
});

var shotType = function(delta, owner, state, pattern) {
    for (var i=0, shots=5; i<shots; ++i) {
        pattern.fire(new Bullet({
            x: owner.x, y: owner.y, owner: owner,
            angle: (15 / shots * i) - 7,
            image: 'bullets/circlegreensm.png',
            life: 1000,
            speed: 15
        }), state);
    }
    pattern.cooldown = 15;
};

var addCircle = function(delta, owner, state) {
    if (state.frame % 5 || (owner && owner.outOfBounds())) 
        return;
    var area = state.gameArea;
    var x = owner ? owner.x : area.width / 2,
        y = owner ? owner.y : area.height / 2;
    var angle = this.angle || 0;
    var bullet = new Bullet({
        x: x, y: y,
        angle: angle, life: 500,
        image: 'bullets/arrow.png',
        scale: 0.5,
        owner: owner,
        tasks: [
            function(delta, bullet, state) {
                bullet.angle += 0.25;
            }
        ]
    });
    bullet.model.color.setHSV(Math.random(), 1, 1);
    state.add(bullet);
    this.angle = (angle + 16) % 360;
};

return GameSceneTest;

});