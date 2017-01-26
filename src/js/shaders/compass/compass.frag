module.exports = `

    uniform sampler2D circleTex;
    uniform sampler2D triangleTex;
    uniform float angle;
    uniform float opacity;
    varying vec2 vUv;

    void main(){

        float a_sin = sin(angle);
        float a_cos = cos(angle);

        mat2 m = mat2(a_cos, -a_sin, a_sin, a_cos);

        vec2 tempUV = vUv;

        tempUV -= 0.5;
        tempUV *= m;
        tempUV += 0.5;

        vec4 circle = texture2D(circleTex, tempUV);

        vec4 triangle = texture2D(triangleTex, vUv);


        gl_FragColor = (circle + triangle) * vec4(opacity);
    }
`