define(function(require) {

var Danmakufu = require('./Danmakufu/Danmakufu');
var GameScene = require('./GameScene');
var Bullet = require('./Bullet');
var BulletPattern = require('./BulletPattern');
var Player = require('./Player');
var Tasks = require('./Tasks');
var OverlayState = require('./OverlayState');
var Entity = require('./Entity');
var Enemy = require('./Enemy');
var PolarVector = require('./PolarVector');

var DanmakufuScene = GameScene.extend({
    init: function(core, file) {
        this._super(core);
        var that = this;
        this.addPlayer();
        this.foreground = new OverlayState(core);
        this.foreground.uiFrame = new Entity({ x: 0, y: 0, image: 'frame.png' });
        this.foreground.add(this.foreground.uiFrame);
        this.danmakufu = Danmakufu.loadFile(file, {
            // function dictionary
        });
        this.danmakufu.execute(function(script) {
            that.main = new script.script_enemy_main();
            that.script = script;
            that.main.Initialize();
            that.initialized = true;
        });
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
    
    update: function(delta) {
        if (this.initialized) {
            this.main.MainLoop();
            this._super(delta);
        }
    },

    render: function(renderer) {
        if (this.initialized) {
            this.main.DrawLoop();
        }
        this._super(renderer);
    },

    onDeactivate: function() {
        if (this.initialized) {
            this.main.Finalize();
        }
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

return DanmakufuScene;

});