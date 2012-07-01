define(function(require) {

var GameStateManager = Class.extend({
    init: function() {
        this.states = [];
    },
    
    add: function(state) {
        this.states.push(state);
        state.onActivate();
    },
    
    remove: function() {
        var state = this.states.pop();
        state.onDeactivate();
    },
    
    toEntryPoint: function() {
        while (this.states.length > 1) {
            this.remove();
        }
    },
    
    current: function() {
        return this.states[this.states.length - 1];
    },

    onResized: function(width, height) {
        this.states.forEach(function(state) {
            if (state.onResized) {
                state.onResized(width, height);
            }
        });
    }
});

return GameStateManager;

});