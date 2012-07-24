define(function(require) {

var GameState = Class.extend({
    init: function(core, background, foreground, camera) {
        this.core = core;
        this.background = background || null;
        this.foreground = foreground || null;
        this.entities = [];
        this.paused = false;
        this.frame = 0;
        this.gridSpace = 200;
        this.entityCount = {};
    },

    update: function(delta) {
        ++this.frame;
        var entity, entities = this.entities;
        var entitiesToRemove = [];
        this.entitiesByGrid = [];
        for (var i=0, iMax = entities.length; i<iMax; ++i) {
            entity = entities[i];
            entity.update(delta);
            if (!entity.alive) {
                this.remove(entity);
                iMax = entities.length;
                --i;
            } else {
                if (entity.x && entity.y) {
                    var location = this.getGridLocation(entity);
                    this.entitiesByGrid[location] = this.entitiesByGrid[location] || [];
                    this.entitiesByGrid[location].push(entity);
                }
            }
        }
    },

    getGridLocation: function(entity) {
        var space = this.gridSpace,
            xLocation = Math.round(entity.x / space),
            yLocation = Math.round(entity.y / space);
        return ((xLocation + 1) * (yLocation + 1));
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
        this.entityCount[entity.type] = this.entityCount[entity.type] || 0;
        ++this.entityCount[entity.type];
        this.entities.push(entity);
    },

    remove: function(entity) {
        var location = this.entities.indexOf(entity);
        entity.state = null;
        if (location !== -1) {
            --this.entityCount[entity.type];
            this.entities.splice(location, 1);
        }
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