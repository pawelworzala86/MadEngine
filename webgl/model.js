function deg2rad(deg){
    return deg*(Math.PI/180)
}

class Model extends Scene{
    constructor(gl){
        super(gl)
        //this.mo_matrix = mat4.create()
        //this.CreateModel(path)
    }
    async CreateModel(path){
        var gl = this.gl

        /*var geometries = await loadOBJ(path)
        var shader = await CreateShader(this.gl)

        for(let geom of geometries){
            var mesh = new Mesh(this.gl, shader, geom)
            this.childrens.push(mesh)
        }

        return*/

        path = 'https://webgl2fundamentals.org/webgl/resources/models/killer_whale/whale.CYCLES.gltf';

        var gltf = await loadGLTF(path)
        var shader = await CreateShader(this.gl)
    
        var idx = 0
        for(let geom of gltf.meshes){
            var matrix = mat4.create()
            for(let scene of gltf._scenes){
                if(scene.mesh==idx){
                    //mat4.rotateX(matrix,matrix,scene.rotation[0])
                    //mat4.rotateY(matrix,matrix,scene.rotation[1])
                    //mat4.rotateZ(matrix,matrix,scene.rotation[2])
                    //mat4.translate(matrix,matrix,scene.translation)
                    mat4.fromRotationTranslation(matrix,scene.rotation,scene.translation)
                }
            }
            var data = {
                position: geom.geometry.positions,
                coord: geom.geometry.coords,
                normal: geom.geometry.normals,
                indices: geom.geometry.indices,
            }
            var mesh = new Mesh(this.gl, shader, data)
            mesh.modelMatrix = matrix
            this.childrens.push(mesh)
            idx++
        }

        //mat4.fromRotationTranslation(this.modelMatrix,[deg2rad(180),0,0,0],[0,0,0])
    }
}

var OBJCACHE = {}

async function loadOBJ(path){
    if(OBJCACHE[path]){
        return OBJCACHE[path]
    }
    const obj = await get(path)

    const lines = obj.split('\n')

    var meshes = []
    var model = {position:[],normal:[],coord:[],indices:[],}
    var outmodel
    function newMesh(){
        //model = {position:[],normal:[],coord:[],indices:[],}
        outmodel = {position:[],normal:[],coord:[]}
        meshes.push(outmodel)
    }

    //console.log(lines[0])
    var FUNCS = {
        o(params){
            newMesh()
        },
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

    OBJCACHE[path] = meshes

    return meshes
}


function glTypedArray(val){
    return {
        '5120': Int8Array,
        '5121': Uint8Array,
        '5122': Int16Array,
        '5123': Uint16Array,
        '5124': Int32Array,
        '5125': Uint32Array,
        '5126': Float32Array
    }[val]
}

function NumSize(val){
    return {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    }[val]
}


async function loadGLTF(path){

    //this.source.rotation[0]=degToRad(45)

   // const {gl,engine} = this

    //let shader = await new Shader(engine,"default")
    //await shader.load("default")

    //var shader = this.shader??await new Shader(engine,"default")

    const gltf = JSON.parse(await get(path))

    path=path.replace(path.split('/').pop(),'')

    //console.log(gltf)

    for(const key of Object.keys(gltf['buffers'])){
        const url=path+'/'+gltf['buffers'][key]['uri']
        gltf.buffers[key]=(await get(url,'arrayBuffer'))
    }

    console.log(gltf.buffers)

    gltf['data']=gltf['accessors'].map(accessor=>{
        const bufferView=gltf['bufferViews'][accessor['bufferView']]
        const TypedArray = glTypedArray(accessor['componentType'])
        return new TypedArray(
            gltf.buffers[bufferView['buffer']],
            bufferView['byteOffset'],//+ (accessor.byteOffset || 0),
            accessor['count']* NumSize(accessor['type']))
    })

    if(gltf['images']){
        gltf.images=gltf.images.map(image=>{
            return image['uri']
        })
    }

    if(gltf['textures']){
        gltf.textures=gltf.textures.map(texture=>{
            return gltf.images[texture['source']]
        })
    }

    if(gltf.materials){
        gltf['materials']=gltf.materials.map(material=>{
            const returnMaterial={}
            if(material['pbrMetallicRoughness']){
                const mat = material['pbrMetallicRoughness']
                if(mat['baseColorFactor']){
                    returnMaterial.diffuse = mat['baseColorFactor']
                }
                if(mat['baseColorTexture']){
                    returnMaterial.diffuseTexture = gltf.textures[mat.baseColorTexture['index']]
                }
            }
            if(material.normalTexture){
                returnMaterial.normalTexture = gltf.textures[material['normalTexture']['index']]
            }
            if(material.emissiveTexture){
                returnMaterial.emissiveTexture = gltf.textures[material['emissiveTexture']['index']]
            }
            return returnMaterial
        })
    }

    gltf['__meshes'] = gltf['meshes']

    gltf['meshes']=gltf.meshes.map(mesh=>{
        let buff={geometry:{}}
        const set=(name,param)=>{
            let geom=gltf['data'][mesh['primitives'][0]['attributes'][param]]
            if(geom){
                buff.geometry[name]=geom
            }
        }
        set('tangents','TANGENT')
        set('coords','TEXCOORD_0')
        set('positions','POSITION')
        set('normals','NORMAL')
        buff.geometry['indices']=gltf['data'][mesh['primitives'][0]['indices']]
        //const material = gltf.materials[mesh.primitives[0]['material']]

        if(gltf.materials){
            buff.material = gltf.materials[mesh.primitives[0]['material']]
        }
        return buff
    })

    const skinNodes = []
    const nodes=[]
    for(const node of gltf.nodes){
        //let scene
        if(typeof node['mesh']!='undefined'){
            const mesh=gltf['meshes'][node.mesh]
            
            var scene = {}
            //await scene.load(mesh.geometry)
            scene.uniforms=mesh.material

            if(node.skin!==undefined) {
                skinNodes.push({node, mesh: scene, skinNdx: node.skin})
            }
        }else{
            var scene={}
        }
        //scene.matrix = node.matrix
        Object.assign(scene,node)
        nodes.push(scene)
    }
    gltf._nodes = gltf.nodes
    gltf.nodes = nodes

    if(gltf.skins){
        gltf.skinsA = gltf.skins.map((skin) => {
            //const joints = skin.joints.map(ndx => gltf.nodes[ndx])
            //const {stride, array} = getAccessorTypedArrayAndStride(gl, gltf, skin.inverseBindMatrices)
            //const bufferView=gltf['bufferViews'][skin.inverseBindMatrices]
            return gltf['data'][skin.inverseBindMatrices]
        })
    }

    for (const {node, mesh, skinNdx} of skinNodes) {
        //var scene = mesh//new Mesh(gl,shader)
        //mesh.setSkin(gltf.skins[node.skin].joints, gltf.skinsA[skinNdx])
        //node.drawables.push(new SkinRenderer(mesh, gltf.skins[skinNdx]))
    }


    function childrens(node){

        node.children = (node.children??[]).map(index=>{
            node = gltf.nodes[index]
            childrens(node)
            return node
        })

    }
    gltf.children = []
    gltf._scenes=[]
    gltf.scenes.map(scene=>{
        scene.nodes.map(node=>{
            var root = gltf.nodes[node]
            //gltf.children.push(root)
            childrens(root)
            gltf._scenes.push(root)
        })
    })

    //gltf.children = []
    //childrens(gltf.childrens[])
    //gltf.scenes[0].nodes.map(idx=>gltf.childrens.push(...childrens(gltf.nodes[idx])))

    console.log('gltf...',gltf)
    //console.log(gltf.nodes)
    //console.log(gltf.scenes)
    //console.log(gltf.children)

    return gltf
}