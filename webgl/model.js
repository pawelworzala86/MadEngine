class Model{
    constructor(gl,path){
        this.gl = gl
        this.mo_matrix = mat4.create()
        this.meshes = []
        this.CreateModel(path)
    }
    async CreateModel(path){
        var geometry = await loadOBJ(path)
        var shader = await CreateShader(this.gl)

        var mesh = new Mesh(this.gl, shader, geometry)
        this.meshes.push(mesh)
    }
    Render(proj_matrix,view_matrix){
        for(let mesh of this.meshes){
            mesh.Render(proj_matrix,view_matrix,this.mo_matrix) 
        }
    }
}

async function loadOBJ(path){
    const obj = await get(path)

    const lines = obj.split('\n')

    var model = {position:[],normal:[],coord:[],indices:[],}
    var outmodel = {position:[],normal:[],coord:[]}

    //console.log(lines[0])
    var FUNCS = {
        v(params){
            model.position.push(params.map(parseFloat))
        },
        vn(params){
        model.normal.push(params.map(parseFloat))
        },
        vt(params){
        model.coord.push(params.map(parseFloat))
        },
        f(params){
            params=params.map(f=>{
                var arr = f.split('/')
                arr = arr.map(a=>parseInt(a))
                //model.indices.push(...arr)
                return arr
            })
            outmodel.position.push(
                ...model.position[params[0][0]-1],
                ...model.position[params[1][0]-1],
                ...model.position[params[2][0]-1]
            )
            outmodel.coord.push(
                ...model.coord[params[0][1]-1],
                ...model.coord[params[1][1]-1],
                ...model.coord[params[2][1]-1]
            )
            outmodel.normal.push(
                ...model.normal[params[0][2]-1],
                ...model.normal[params[1][2]-1],
                ...model.normal[params[2][2]-1]
            )
            //model.indices.push(params[0][1],params[1][1],params[2][1])
            //model.indices.push(params[0][2],params[1][2],params[2][2])
        },
    }

    

    for(const line of lines){

        var key = line.split(' ')[0]
        var params = line.split(' ').map(a=>a.trim())
        params.splice(0,1)
        
        if(FUNCS[key]!==undefined){
            FUNCS[key](params)
        }

    }

    return outmodel
}