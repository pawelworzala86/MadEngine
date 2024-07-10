precision mediump float;

varying vec3 vNormal;

vec3 u_reverseLightDirection = vec3(0.5, 0.7, 1.0);
            
void main(void) {

    vec3 normal = normalize(vNormal);
 
    float light = dot(normal, u_reverseLightDirection);


    gl_FragColor = vec4(vec3(light-0.1), 1.);
}