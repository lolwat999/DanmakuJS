define(function(require) {
	
var Entity = require('./Entity');
var InputMap = require('./InputMap');
var Input = require('./Input');

var Player = Entity.extend({
	init: function(options) {
		this._super(options);
		this.shots = options.shots || {};
		this.inputMap = new InputMap();
	},

	set: function(options) {
		this._super(options);
		this.defaultSpeed = options.speed || 5;
		this.focusSpeed = options.focusSpeed || this.defaultSpeed / 2;
	},

	getKey: function(mappedKey) {
		return this.inputMap.map[mappedKey];
	},

	isKeyPressed: function(mappedKey) {
		return Input.isKeyPressed(Input.keys[this.inputMap.map[mappedKey]]);
	},

	update: function(delta) {
		if (this.alive) {
			this.control();
			this._super(delta);
			this.stayInBounds();
		}
	},

	control: function() {
		var up = this.isKeyPressed('Up'), 
			down = this.isKeyPressed('Down'), 
			left = this.isKeyPressed('Left'), 
			right = this.isKeyPressed('Right'),
			focus = this.isKeyPressed('Focus'),
			speed = focus ? this.focusSpeed : this.defaultSpeed,
			angle,
			shots = this.shots;
		for (var i in shots) {
			var shot = shots[i];
			if (this.isKeyPressed(i)) {
				shot.update(delta, this);
			}
		}
		this.xSpeed = 0;
		this.ySpeed = 0;
		if (up) {
			this.ySpeed = -speed;
		} else if (down) {
			this.ySpeed = speed;
		}
		if (left) {
			this.xSpeed = -speed;
		} else if (right) {
			this.xSpeed = speed;
		}
		if (up || down || left || right) {
			angle = Math.atan2(this.ySpeed, this.xSpeed);
			this.xSpeed = speed * Math.cos(angle);
			this.ySpeed = speed * Math.sin(angle);
		}
	}
});

return Player;

});