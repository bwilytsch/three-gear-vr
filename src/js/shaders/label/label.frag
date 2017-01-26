module.exports = `
    uniform sampler2D tex;
    uniform float opacity;
    varying vec2 vUv;

    void main(){
        vec4 texture = texture2D(tex, vUv);
        gl_FragColor = vec4(texture.xyz, opacity);
    }
`