export function initEngine(importObject) {
    if (importObject.Engine == null) {
        importObject.Engine = {};
    }
    importObject.Engine.test = function(){
        alert('kuku')
    }
}