define(function(require) {
    
var BulletPattern = Class.extend({
    init: function(options) {
        var that = this;
        options = options || {};
        this.bullets = [];
        this.frame = 0;
        this.isEnabled = true;
        this.cooldown = 0;
        _.extend(this, options);
        if (options.update) {
            this.update = function(delta, owner, state) {
                ++this.frame;
                if (this.isEnabled && !this.cooldown) {
                    options.update(delta, owner, state, that);
                }
                if (that.cooldown > 0) {
                    --that.cooldown;
                }

            };
        }
    },

    fire: function(bullet, state) {
        var that = this;
        state.add(bullet);
        that.bullets.push(bullet);
        bullet.on('death', function(bullet) {
            that.bullets.splice(that.bullets.indexOf(bullet), 1);
        });
    },

    update: function(delta, owner, state) {
        ++this.frame;
    }
});

return BulletPattern;

});