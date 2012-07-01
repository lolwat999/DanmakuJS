define(function(require) {

var Entity = require('./Entity');
var Position = require('./Components/Position');
var Sprite = require('./Components/Sprite');

var GameObject = Entity.extend({
	set: function(options) {
		this._super(options);
        if (options.position) {
            this.add(new Position(options.position));
        }
        if (options.image) {
            this.add(new Sprite(options.image));
        }
        if (options.model) {
            if (!options.model.family) {
                options.model = new Sprite(options.model);
            }
            this.add(options.model);
        }
	},

	update: function(options) {
		this._super(options);
        if (this.position && this.model) {
            var parentX = this.parent ? this.parent.x : 0;
            var parentY = this.parent ? this.parent.y : 0;
            this.model.position.x = this.position.x + parentX;
            this.model.position.y = this.position.y + parentY;
        }
	}
});

});