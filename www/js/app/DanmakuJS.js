define(function (require) {

require('lib/game-shim')
require('lib/inheritance');
require('lib/jquery-1.8b1');
var _ = require('lib/underscore-min');
var Stats = require('lib/Stats');
var THREE = require('lib/Three');
var GameSceneTest = require('GameSceneTest');
var GameStateManager = require('GameStateManager');
var Input = require('Input');
var Danmakufu = require('Danmakufu/Danmakufu');

var DanmakuJS = function() {
    var that = this;
    this.stats = new Stats();
    this.timer = new THREE.Clock();
    this.scaleX = 1;
    this.scaleY = 1;
    this.gameStateManager = new GameStateManager();
    
    this.start = function(options) {
        options = options || {};
        this.container = $((options.container || document.body));
        var width = that.container.width(), 
            height = that.container.height();
        that.container.html(' ');
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setSize(width, height);
        that.container.append(that.renderer.domElement);
        Input.bind(that.container[0]);
        that.gameStateManager.add(new GameSceneTest(that));
        window.addEventListener('resize', this.onResized, false);
        that.setDebug(options.debug);
        that.mainLoop();

        that.testDanmakufu('sample.txt');
    };

    this.testDanmakufu = function(file) {
        var danmakufu = Danmakufu.loadFile(file);
        danmakufu.execute(function(script) {
            var main = new script.script_enemy_main();
            main.Initialize();
        });
    };

    this.setDebug = function(debug) {
        if (debug) {
            $(that.stats.domElement).addClass('overlay');
            that.container.append(that.stats.domElement);
        } else {
            $(that.stats.domElement).remove();
        }
    },
    
    this.mainLoop = function() {
        that.stats.begin();
        that.gameStateManager.current().updateAll(that.timer.getDelta());
        that.gameStateManager.current().renderAll(that.renderer);
        that.stats.end();
        requestAnimationFrame(that.mainLoop);
    };
    
    this.setSize = function(scaleX, scaleY) {
        that.scaleX = scaleX;
        that.scaleY = scaleY;
        that.onResized();
    };
    
    this.onResized = function() {
        var width = that.container.width() * that.scaleX, 
            height = that.container.height() * that.scaleY;
        that.renderer.setSize(width, height);
        that.gameStateManager.onResized(width, height);
    };
};

this.DanmakuJS = new DanmakuJS();

return this.DanmakuJS;
    
});