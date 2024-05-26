export function initEngine(importObject) {
    var memory = importObject.env.memory

    if (importObject.Engine == null) {
        importObject.Engine = {};
    }
    importObject.Engine.testA = function(){
        //const myArray = [1, 2, 3, 4];

        //const arrayPointer = module._malloc(myArray.length * 4); // 4 bajty na int
        //module.HEAP32.set(myArray, arrayPointer / 4);

        return new Float32Array([3.3,0.25])
    }
    importObject.Engine.testB = function(arrayPointer){
        console.log(new Float32Array(arrayPointer))

        const array = new Float32Array(memory.buffer, arrayPointer, 16);
      // Tutaj możesz wykonać operacje na tablicy
      console.log(array);
    }
}