define(["require","./Entity","./Components/Position","./Components/Sprite"],function(a){var b=a("./Entity"),c=a("./Components/Position"),d=a("./Components/Sprite"),e=b.extend({set:function(a){this._super(a),a.position&&this.add(new c(a.position)),a.image&&this.add(new d(a.image)),a.model&&(a.model.family||(a.model=new d(a.model)),this.add(a.model))},update:function(a){this._super(a);if(this.position&&this.model){var b=this.parent?this.parent.x:0,c=this.parent?this.parent.y:0;this.model.position.x=this.position.x+b,this.model.position.y=this.position.y+c}}})})