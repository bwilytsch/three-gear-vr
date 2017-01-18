module.exports = `

    uniform sampler2D circleTex;
    uniform sampler2D triangleTex;
    uniform float angle;
    varying vec2 vUv;

    void main(){

        mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

        vec2 tempUV = vUv;

        tempUV -= 0.5;
        tempUV *= m;
        tempUV += 0.5;

        vec4 circle = texture2D(circleTex, tempUV);

        vec4 triangle = texture2D(triangleTex, vUv);

        gl_FragColor = circle + triangle;
    }
`