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
        this.objectsByID = {};
        this.idCount = 0;
        this.enemy = this.addEnemy();
        this.player = this.addPlayer();
        this.foreground = new OverlayState(core);
        this.foreground.uiFrame = new Entity({ x: 0, y: 0, image: 'frame.png' });
        this.foreground.add(this.foreground.uiFrame);
        this.danmakufu = Danmakufu.loadFile(file, this.getScriptFunctions());
        this.danmakufu.execute(function(script) {
            that.main = new script.script_enemy_main();
            that.script = script;
            that.main.Initialize();
            that.initialized = true;
            that.comments = that.script.__comments__;
            that.script.__startTime__ = new Date();
        });
    },

    addEnemy: function() {
        var that = this;
        var enemy = new Enemy({
            x: that.gameArea.width / 2, 
            y: 1000,
            scale: 2.5,
            angle: 180,
            tasks: []
        });
        this.add(enemy);
        return enemy;
    },

    addPlayer: function() {
        var that = this;
        var player = new Player({
            x: that.gameArea.width / 2, 
            y: 100,
            image: 'characters/marisa.png',
            scale: 2.5,
            shots: {
                Shoot: shotType
            }
        });
        this.add(player);
        return player;
    },

    remove: function(entity) {
        this._super(entity);
        if (entity.id) {
            delete this.objectsByID[entity.id];
        }
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
    },

    getScriptFunctions: function() {
        var that = this;
        return {
            // Global functions
            LoadGraphic: function(file) {
                that.enemy.setImage(file);
            },

            SetLife: function(life) {
                that.enemy.life = life;
            },

            GetX: function() {
                return that.enemy.x;
            },

            GetY: function() {
                return that.enemy.y;
            },

            SetX: function(x) {
                that.enemy.x = x;
            },

            SetY: function(y) {
                that.enemy.y = y;
            },

            GetPlayerX: function() {
                return that.player.x;
            },

            GetPlayerY: function() {
                return that.player.y;
            },

            GetCenterX: function() {
                return that.gameArea.width / 2;
            },

            GetCenterY: function() {
                return that.gameArea.height / 2;
            },

            GetClipMinX: function() {
                return that.gameArea.x;
            },

            GetClipMinY: function() {
                return that.gameArea.y;
            },

            GetClipMaxX: function() {
                return that.gameArea.x + that.gameArea.width;
            },

            GetClipMaxY: function() {
                return that.gameArea.y + that.gameArea.height;
            },

            GetTime: function() {
                return new Date() - that.script.__startTime__;
            },

            GetFPS: function() {
                return DanmakuJS.stats.FPS;
            },

            CreateShot01: function(x, y, speed, angle, image, delay) {
                if (!that.enemy.alive) {
                    return;
                }
                that.add(new Bullet({
                    x: x, y: y, speed: speed, 
                    angle: angle + 180, image: image,
                    owner: that.enemy, life: 10000,
                    delay: delay
                }));
            },

            Obj_Create: function(type) {
                var entity = new EntityType[type]();
                entity.owner = that.enemy;
                if (that.enemy.alive) {
                    that.add(entity);
                }
                var id = entity.id = ++that.idCount;
                that.objectsByID[id] = entity;
                return id;
            },

            Obj_SetPosition: function(obj, x, y) {
                obj = that.objectsByID[obj];
                obj.x = x;
                obj.y = y;
            },

            Obj_SetAngle: function(obj, angle) {
                obj = that.objectsByID[obj];
                obj.angle = angle;
            },

            Obj_SetSpeed: function(obj, v) {
                obj = that.objectsByID[obj];
                obj.speed = v;
            },

            ObjShot_SetGraphic: function(obj, image) {
                obj = that.objectsByID[obj];
                obj.setImage(image);
            },

            ObjShot_SetDelay: function(obj, delay) {
                obj = that.objectsByID[obj];
                if (obj) {
                    obj.delay = 0;
                    if (delay > 0 && obj.model) {
                        obj.model.opacity = 0;
                        obj.canCollide = false;
                    }
                }
            },

            Obj_BeDeleted: function(obj) {
                obj = that.objectsByID[obj];
                return obj.alive;
            }
        };
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

var EntityType = {
    Bullet: Bullet,
    Entity: Entity,
    Enemy: Enemy
};

return DanmakufuScene;

});