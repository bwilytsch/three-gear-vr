module.exports = `
    uniform sampler2D crosshairTex;
    varying vec2 vUv;

    void main(){
        gl_FragColor = texture2D(crosshairTex, vUv);
    }
`