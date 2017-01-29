module.exports = `

    uniform vec3 light;
    uniform sampler2D normalMap;
    uniform sampler2D diffuseMap;
    uniform sampler2D specularMap;
    uniform float shininess;

    varying vec2 vUv;
    varying vec3 lightVector;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main(){

        // Diffuse
        vec3 vNormalMap = normalize(texture2D(normalMap, vUv).rgb) * 2.0 - 1.0;
        float diffuse = max(0.0, dot(vNormalMap, lightVector));


        // Specular
        vec3 cameraVector = normalize(cameraPosition - vPosition);
        vec3 halfVector = normalize(cameraPosition + lightVector);
        float nxHalf = max(0.0, dot(vNormal, halfVector));
        float specularPower = pow(nxHalf, shininess);

        vec4 specular = texture2D(specularMap, vUv) * specularPower;

        vec4 color = texture2D(diffuseMap, vUv);
        gl_FragColor = color + specular + vec4(0.16);
    }

`