define(function(require) {

var THREE = require('lib/Three');

var Tasks = Class.extend({
    init: function(options) {
        var that = this;
        this.time = 0;
        this.life = options.life || Infinity;
        this._tasks = [];
        this.alive = true;
        if (options._tasks) {
            options.tasks = options._tasks;
        }
        if (options.tasks) {
            options.tasks.forEach(function(task) {
                that.add(task);
            }) 
        }
    },

    add: function(task) {
        if (typeof task === 'function') {
            task = { update: task };
        }
        task.tasks = this;
        task.time = 0;
        this._tasks.push(task);
    },

    remove: function(task) {
        this._tasks.splice(this._tasks.indexOf(task), 1);
    },

    clear: function() {
        this._tasks = [];
    },

    getAll: function() {
        return this._tasks;
    },
    
    update: function(delta, parent) {
        if (this.alive) {
            var timeIncrement = delta / 0.016666;
            var tasks = this._tasks;
            if (tasks && tasks.length) {
                for (var i=0, iMax = tasks.length; i<iMax; ++i) {
                    var task = tasks[i];
                    task.update(delta, parent, parent ? parent.state : this.state);
                    task.time += timeIncrement;
                }
            }
            if (this.life !== Infinity) {
                this.time += timeIncrement;
                if (this.time > this.life) {
                    this.alive = false;
                }
            }
        }
    }
});

return Tasks;

});