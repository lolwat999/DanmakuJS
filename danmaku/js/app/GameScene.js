define(["require","lib/Three","./GameState","./Entity"],function(a){var b=a("lib/Three"),c=a("./GameState"),d=a("./Entity"),e=c.extend({init:function(a,c,d,e,f){this._super(a,c,d);var g=this.core.container.width(),h=this.core.container.height();this.scene=f||new b.Scene,this.camera=e||new b.PerspectiveCamera(60,g/h,1,5e3),this.camera.position.z=1300,this.scene.add(this.camera),this.gameArea={x:0,y:0,width:1320,height:1515},this.camera.position.x=300+this.gameArea.x+this.gameArea.width/2,this.camera.position.y=this.gameArea.y+this.gameArea.height/2-35,this.collisionTestStep=1},add:function(a){this._super(a),a.model&&this.scene.add(a.model)},update:function(a){this._super(a),this.frame%this.collisionTestStep||this.checkCollision(a)},checkCollision:function(a){var b=this.entitiesByGrid;for(var c in b){var d=b[c];for(var e=0,f=d.length;e<f;++e){var g=d[e],h=g.constructor;if(h)for(var i=e;i<f;++i){var j=d[i];!(j instanceof h)&&g.collides&&g.collides(j)&&(g.emit("collision:"+j.getType(),g,j),j.emit("collision:"+g.getType(),j,g))}}}},remove:function(a){this._super(a),a.model&&this.scene.remove(a.model)},render:function(a){for(var b=0,c=this.entities.length;b<c;++b){var d=this.entities[b];d.model&&(d.model.visible=!d.outOfBounds(20))}a.render(this.scene,this.camera)},onResized:function(a,b){this.camera.aspect=a/b,this.camera.updateProjectionMatrix()}});return e})