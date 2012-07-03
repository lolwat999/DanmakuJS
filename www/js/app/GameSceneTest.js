define(function(require) {

var GameScene = require('./GameScene');
var Bullet = require('./Bullet');
var Player = require('./Player');
var Tasks = require('./Tasks');
var OverlayState = require('./OverlayState');
var Entity = require('./Entity');
var Enemy = require('./Enemy');

var GameSceneTest = GameScene.extend({
    init: function(core, background, foreground) {
        var that = this;
        this._super(core, background, foreground);
        this.add(new Player({
            x: that.gameArea.width / 2, 
            y: 100,
            image: 'characters/marisa.png',
            scale: 2.5
        }))
        this.foreground = new OverlayState(core);
        this.foreground.frame = new Entity({ x: 0, y: 0, image: 'frame.png' });
        this.foreground.add(this.foreground.frame);
    },

    addEnemy: function(delta) {
        var state = this;
        if (!(state.frame % 30)) {
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

var addCircle = function(delta, owner, state) {
    if (state.frame % 5 || (owner && owner.outOfBounds())) 
        return;
    var area = state.gameArea;
    var x = owner ? owner.x : area.width / 2,
        y = owner ? owner.y : area.height / 2;
    var angle = this.angle || 0;
    state.add(new Bullet({
        x: x, y: y,
        angle: angle, life: 500,
        image: 'bullets/arrow.png',
        color: Math.floor(Math.random() * 16777216),
        owner: owner,
        tasks: [
            function(delta, bullet, state) {
                bullet.angle += 0.25;
            }
        ]
    }));
    this.angle = (angle + 16) % 360;
};

return GameSceneTest;

});