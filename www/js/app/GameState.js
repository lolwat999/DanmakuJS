define(function(require) {

var GameState = Class.extend({
    init: function(core, background, foreground, camera) {
        this.core = core;
        this.background = background || null;
        this.foreground = foreground || null;
    },
    
    updateAll: function(delta) {
        if (this.background) {
            this.background.updateAll(delta);
        }
        if (this.update) {
            this.update(delta);
        }
        if (this.foreground) {
            this.foreground.updateAll(delta);
        }
    },
    
    renderAll: function(renderer) {
        if (this.background) {
            this.background.renderAll(renderer);
        }
        if (this.render) {
            this.render(renderer);
        }
        if (this.foreground) {
            this.foreground.renderAll(renderer);
        }
    },
    
    onResized: function(width, height) { },
    
    onActivate: function() { },
    
    onDeactivate: function() { }
});

return GameState;

});