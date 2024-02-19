class Scene{
    constructor(gl){
        this.gl = gl
        this.modelMatrix = mat4.create()
        this.childrens=[]
    }
    Render(proj_matrix,view_matrix,matrixParent=mat4.create()){
        for(let scene of this.childrens){
            var matrix = mat4.create()
            mat4.multiply(matrix,matrixParent,this.modelMatrix)
            scene.Render(proj_matrix,view_matrix,matrix)
            if(scene.Draw){
                scene.Draw(proj_matrix,view_matrix,matrix)
            }
        }
    }
}