define(function(require) {
    
var PolarVector = Class.extend({
    init: function(radius, angle) {
        this.radius = radius;
        this.angle = angle;
    },

    clone: function() {
        return new PolarVector(radius, angle);
    }
});

PolarVector.fromCart = function(x, y) {
    if (typeof x === 'object') {
        y = x.y;
        x = x.x;
    }
    return new PolarVector((Math.sqrt((y*y)+(x*x)), Math.atan2(y,x)));
};

PolarVector.toCart = function(radius, angle) {
    if (typeof radius === 'object') {
        angle = radius.angle;
        radius = radius.radius;
    }
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
};

return PolarVector;

});