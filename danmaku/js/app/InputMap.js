define(["require","./Input"],function(a){var b=a("./Input"),c=Class.extend({init:function(a){a||(a=this.defaultMap),this.map=a},defaultMap:{Shoot:"KEY_Z",Bomb:"KEY_X",Left:"LEFT_ARROW",Right:"RIGHT_ARROW",Up:"UP_ARROW",Down:"DOWN_ARROW",Focus:"SHIFT"},isKeyPressed:function(a){return b.isKeyPressed(b.keys[this.map[a]])}});return c})