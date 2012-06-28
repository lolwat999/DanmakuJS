define(function (require) {

var Stats = require('lib/Stats');
var THREE = require('lib/Three');
var GameSceneTest = require('GameSceneTest');
var GameStateManager = require('GameStateManager');

var DanmakuJS = function(options) {
    options = options || {};
    var that = this;
    this.container = $((options.container || document.body));
    this.stats = new Stats();
    this.timer = new THREE.Clock();
    this.scaleX = 1;
    this.scaleY = 1;
    this.gameStateManager = new GameStateManager();
    
    this.start = function() {
        var width = that.container.width(), 
            height = that.container.height();
        that.container.html(' ');
        that.renderer = new THREE.WebGLRenderer();
        that.renderer.setSize( width, height );
        $(that.stats.domElement).addClass('overlay');
        that.container.append( that.stats.domElement );
        that.container.append( that.renderer.domElement );
        that.gameStateManager.add(new GameSceneTest(that));
        window.addEventListener('resize', this.onResized, false);
        that.mainLoop();
    };
    
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
        that.gameStateManager.states.forEach(function(state) {
            state.onResized(width, height);
        });
        that.renderer.setSize( width, height );
    };
};

return DanmakuJS;
    
});