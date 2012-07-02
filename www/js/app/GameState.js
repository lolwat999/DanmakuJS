define(function(require) {

var GameState = Class.extend({
    init: function(core, background, foreground, camera) {
        this.core = core;
        this.background = background || null;
        this.foreground = foreground || null;
        this.entities = [];
        this.paused = false;
    },

    update: function(delta) {
        var entity, entities = this.entities;
        for (var i=0, iMax = entities.length; i<iMax; ++i) {
            entity = entities[i];
            entity.update(delta);
            if (!entity.alive) {
                this.remove(entity);
                iMax = entities.length;
                --i;
            }
        }
    },
    
    updateAll: function(delta) {
        if (this.background) {
            this.background.updateAll(delta);
        }
        if (this.update && !this.paused) {
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

    add: function(entity) {
        entity.state = this;
        this.entities.push(entity);
    },

    remove: function(entity) {
        entity.state = null;
        this.entities.splice(this.entities.indexOf(entity), 1);
    },

    clear: function() {
        this.entities = [];
    },

    getSize: function() {
        var container = this.core.container,
            width = container.width(),
            height = container.height();
        return { width: width, height: height };
    },
    
    onActivate: function() { },
    
    onDeactivate: function() { }
});

return GameState;

});