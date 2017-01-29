module.exports = `

    uniform vec2 repeatUV;
    uniform vec3 light;

    varying vec2 vUv;
    varying vec3 lightVector;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {

        vUv = uv * repeatUV;
        vPosition = position;
        vNormal = normal;
        lightVector = normalize(cameraPosition - position);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    }

`