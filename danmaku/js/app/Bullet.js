define(["require","lib/Three","./Sprite"],function(a){var b=a("lib/Three"),c=a("./Sprite"),d=c.extend({init:function(a){this._super(a),this.life=a.life||100,this.time=0,this.model.blending=b.AdditiveBlending},dying:function(){var a=this.model.opacity-.01;a<0&&(this.alive=!1),this.model.opacity=a<0?0:a},update:function(a){this.alive&&(this.time+=a/.016666,this.time>this.life&&this.dying(),this._super(a))}});return d})