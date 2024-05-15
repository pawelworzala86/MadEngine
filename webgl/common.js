class Scene{
    constructor(gl){
        this.gl = gl
        this.modelMatrix = mat4.create()
        this.childrens=[]
    }
    Render(proj_matrix,view_matrix,matrixParent=mat4.create()){
        for(let scene of this.childrens){
            if(scene.Draw){
                var matrix = mat4.create()
                //mat4.multiply(matrix,matrixParent,this.modelMatrix)
                mat4.multiply(matrix,matrixParent,this.modelMatrix)
                scene.Draw(proj_matrix,view_matrix,matrix)
            }else{
                var matrix = mat4.create()
                mat4.multiply(matrix,matrixParent,this.modelMatrix)
                scene.Render(proj_matrix,view_matrix,matrix)
            }
        }
    }
}
function deg2rad(deg){
    return deg*(Math.PI/180)
}