define(["require","lib/Three","./GameState"],function(a){var b=a("lib/Three"),c=a("./GameState"),d=c.extend({init:function(a,c,d,e,f){this._super(a,c,d);var g=this.core.container.width(),h=this.core.container.height();this.scene=f||new b.Scene,this.camera=e||new b.OrthographicCamera(g/-2,g/2,h/2,h/-2,0,1e3),this.camera.position.z=200,this.scene.add(this.camera);var i=new b.DirectionalLight(Math.random()*16777215);i.position.x=Math.random()-.5,i.position.y=Math.random()-.5,i.position.z=Math.random()-.5,i.position.normalize(),this.scene.add(i)},add:function(a){this._super(a),a.model&&this.scene.add(a.model)},remove:function(a){this._super(a),a.model&&this.scene.remove(a.model)},render:function(a){a.render(this.scene,this.camera)},onResized:function(a,b){this.camera.left=a/-2,this.camera.right=a/2,this.camera.top=b/2,this.camera.bottom=b/-2,this.camera.updateProjectionMatrix()}});return d})