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
    }
});

return GameStateManager;

});