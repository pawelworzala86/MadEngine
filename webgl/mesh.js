class Mesh extends Scene{
   constructor(gl,meshshader,geometry){
      super(gl)
      this.type = this.gl.TRIANGLES
      this.buffer={}
      this.shader = meshshader
      this.geometry = geometry

      this.CreateBuffers()

      if(geometry.indices){
         this.buffer.index = this.CreateBuffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.geometry.indices))
      }
   }
   CreateBuffers(){
      for(const name of Object.keys(this.geometry)){
         this.buffer[name] = this.CreateBuffer(
            name=='indices'?this.gl.ELEMENT_ARRAY_BUFFER:this.gl.ARRAY_BUFFER,
            name=='indices'?new Uint16Array(this.geometry[name]):new Float32Array(this.geometry[name])
            )
      }
   }
   CreateBuffer(type,data){
      const buffer = this.gl.createBuffer()
      this.gl.bindBuffer(type, buffer)
      this.gl.bufferData(type, data, this.gl.STATIC_DRAW)
      return buffer
   }
   SetAttribute4M(name,value){
      const uniform = this.gl.getUniformLocation(this.shader.program, name)
      this.gl.uniformMatrix4fv(uniform, false, value)
   }
   SetAttributeBuffer(name,buffer,elemCount){
      this.gl.bindBuffer(name=='indices'?this.gl.ELEMENT_ARRAY_BUFFER:this.gl.ARRAY_BUFFER, buffer)
      const attribute = this.gl.getAttribLocation(this.shader.program, name)
      if(attribute>-1){
         this.gl.vertexAttribPointer(attribute, elemCount, this.gl.FLOAT, false,0,0)
         this.gl.enableVertexAttribArray(attribute)
      }
   }
   SetAttributes(){
      for(const name of Object.keys(this.buffer)){
         var size=3
         if(name=='coord'){
            size=2
         }
         this.SetAttributeBuffer(name, this.buffer[name],3)
      }
   }
   Render(proj_matrix,view_matrix,mo_matrix){
      this.gl.useProgram(this.shader.program)

      this.SetAttributes()

      this.SetAttribute4M('Pmatrix', proj_matrix)
      this.SetAttribute4M('Vmatrix', view_matrix)
      this.SetAttribute4M('Mmatrix', mo_matrix)
               
      if(this.geometry.indices){
         this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer.index);
         this.gl.drawElements(this.type, this.geometry.indices.length, this.gl.UNSIGNED_SHORT, 0);
      }else{
         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.vertex);
         this.gl.drawArrays(this.type, 0, this.geometry.position.length/3);
      }    
   }
}