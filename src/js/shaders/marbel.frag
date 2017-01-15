module.exports = `

    uniform float time;
    uniform vec2 res;
    uniform sampler2D tex;
    uniform sampler2D tNormal;
    uniform vec3 light;
    varying vec2 vUv;
    varying vec2 vN;
    varying vec3 vNormal;

    void main(){

        // Note for nomral maps:
        // We calculate the angle between the light source and the normal vector.
        // the smaller the angle the brighter the surface.
        // rgb in normalmap are equivalents for xyz in 3D space.
    
        vec3 normalVector = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;

        // Calculated by getting the distance between the light source and the pixel. Normalized vector afterwards.
        vec3 lightVector = normalize(vec3(light.x - gl_FragCoord.x, light.y - gl_FragCoord.y, 60.0));

        // Calculate each pixel on the screen by getting the resolution and dividing it by the coordinate for the current fragment
        vec2 pixel = gl_FragCoord.xy / res.xy;

        float dist = distance(pixel.xy, lightVector.xy);
        float diffuse = dot(normalVector, lightVector);
        float distanceFactor = (1.0 - dist/(lightVector.z * res.x));


        vec4 color = vec4(1.0,1.0,1.0,1.0);
        vec3 base = texture2D(tex, vN).rgb;
        gl_FragColor = vec4(base, 1.0) * distanceFactor;
    }
`;