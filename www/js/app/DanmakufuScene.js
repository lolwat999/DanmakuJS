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
            delete this.entities[entity.id];
        }
    },
    
    update: function(delta) {
        if (this.initialized) {
            var tasks = this.script.__tasks__;
            for (var i=0, length=tasks.length; i<length; ++i) {
                var task = tasks[i];
                if (task.next()) {
                    tasks.splice(i, 1);
                    --i;
                    --length;
                    task.close();
                }
            }
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
                return entity.id;
            },

            Obj_SetPosition: function(obj, x, y) {
                obj = that.entities[obj];
                if (obj) {
                    obj.x = x;
                    obj.y = y;
                }
            },

            Obj_SetX: function(obj, x) {
                obj = that.entities[obj];
                if (obj) {
                    obj.x = x;
                }
            },

            Obj_SetY: function(obj, y) {
                obj = that.entities[obj];
                if (obj) {
                    obj.y = y;
                }
            },

            Obj_SetAngle: function(obj, angle) {
                obj = that.entities[obj];
                if (obj) {
                    obj.angle = angle;
                }
            },

            Obj_SetSpeed: function(obj, v) {
                obj = that.entities[obj];
                if (obj) {
                    obj.speed = v;
                }
            },

            ObjShot_SetGraphic: function(obj, image) {
                obj = that.entities[obj];
                if (obj) {
                   obj.setImage(image);
                }
            },

            ObjShot_SetDelay: function(obj, delay) {
                obj = that.entities[obj];
                if (obj) {
                    obj.delay = 0;
                    if (delay > 0 && obj.model) {
                        obj.model.opacity = 0;
                        obj.canCollide = false;
                    }
                }
            },

            Obj_BeDeleted: function(obj) {
                obj = that.entities[obj];
                return !obj || !obj.alive;
            },

            Obj_GetX: function(obj) {
                obj = that.entities[obj];
                return obj ? obj.x : 0;
            },

            Obj_GetY: function(obj) {
                obj = that.entities[obj];
                return obj ? obj.y : 0;
            },

            Obj_GetSpeed: function(obj) {
                obj = that.entities[obj];
                return obj ? obj.speed : 0;
            },

            Obj_GetAngle: function(obj) {
                obj = that.entities[obj];
                return obj ? obj.angle : 0;
            },

            SetMovePosition01: function(x, y, speed) {
                if (that.enemy.alive) {
                    that.enemy.moveTowards(x, y, speed);
                }
            },

            GetAngleToPlayer: function() {
                var player = that.player;
                return that.enemy.getAngleFrom(player.x, player.y);
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