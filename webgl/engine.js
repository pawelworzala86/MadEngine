const mat4 = glMatrix.mat4
const vec3 = glMatrix.vec3

var time_old = 0
//controls

var AMORTIZATION = 0.95
var drag = false
var old_x, old_y
var dX = 0, dY = 0
var THETA = 0
var PHI = 0
//
function CreateControls(canvas){
   var mouseDown = function(e) {
      drag = true;
      old_x = e.pageX, old_y = e.pageY;
      e.preventDefault();
      return false;
   };

   var mouseUp = function(e){
      drag = false;
   };

   var mouseMove = function(e) {
      if (!drag) return false;
      dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
      dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
      THETA+= dX;
      PHI+=dY;
      old_x = e.pageX, old_y = e.pageY;
      e.preventDefault();
   };

   canvas.addEventListener("mousedown", mouseDown, false);
   canvas.addEventListener("mouseup", mouseUp, false);
   canvas.addEventListener("mouseout", mouseUp, false);
   canvas.addEventListener("mousemove", mouseMove, false);
}

class Engine{
   constructor(){
      this.models = []
   }
   async load(){

      this.canvas = document.createElement('canvas')
      this.canvas.width=600
      this.canvas.height=600
      document.body.append(this.canvas)
      var gl = this.canvas.getContext('webgl2')
      this.gl = gl


      /*for(let index=0;index<16;index++){
         var model = new Model(gl)
         await model.CreateModel('./models/cube/cube.obj')
         //mat4.scale(model.modelMatrix, model.modelMatrix, [3.0,3.0,3.0])
         mat4.translate(model.modelMatrix,model.modelMatrix,[
            5-Math.random()*10,
            5-Math.random()*10,
            5-Math.random()*10])
         this.models.push(model)
      }*/

      var shader = new Shader(this.gl)
      await shader.load('color')

      var model = new Model(gl,shader)
      await model.CreateModel('./models/tst/scene.gltf')
      this.models.push(model)



      this.proj_matrix = mat4.create()
      mat4.perspective(this.proj_matrix, 45, this.canvas.width/this.canvas.height, 1, 100)
   
      this.view_matrix = mat4.create()
      this.view_matrix[14] = this.view_matrix[14]-4;

      
      

      CreateControls(this.canvas)
   }
   Render(time){
      var gl = this.gl
      var dt = time-time_old;

      if (!drag) {
         dX *= AMORTIZATION, dY*=AMORTIZATION;
         THETA+=dX, PHI+=dY;
      }

      

      time_old = time; 
      gl.enable(gl.DEPTH_TEST);

      gl.depthFunc(gl.LEQUAL);

      gl.clearColor(0.5, 0.5, 0.5, 0.9);
      gl.clearDepth(1.0);
      gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      for(const model of this.models){
         model.modelMatrix = mat4.create()

      mat4.rotateY(model.modelMatrix,model.modelMatrix,THETA)
      mat4.rotateX(model.modelMatrix,model.modelMatrix,PHI)

         model.Render(this.proj_matrix,this.view_matrix)
      }
   }
}



;(async function(){

   var engine = new Engine()
   await engine.load()

   var animate = function(time) {

      engine.Render(time)

      window.requestAnimationFrame(animate);
   }
   animate(0)
    
})()