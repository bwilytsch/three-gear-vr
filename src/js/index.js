'use strict';
// Start web experience
// Include Gamepad Controls
// Controller with crosshair

// THREEJS
import * as THREE from 'three';

global.THREE = THREE;

import VRControls from 'three/examples/js/controls/VRControls';
import VREffect from 'three/examples/js/effects/VREffect';
import WebVRManager from 'webvr-boilerplate/build/webvr-manager';
import Stats from 'stats.js';
import 'es6-promise-polyfill';
import 'webvr-polyfill';

// Global Storage
import Store from './helpers/globalStorage';
import ControlsManager from './helpers/ControlsManager';
import InterfaceManager from './helpers/InterfaceManager';
import LoadingManagerHelper from './helpers/LoadingManager';
import AudioManager from './helpers/AudioManager';
import TextToLabel from './utils/textToLabel';

// CUSTOM SHADERS
let Particles;
const vs = require('./shaders/shader.vert');
const fs = require('./shaders/shader.frag');

const svs = require('./shaders/marbel.vert');
const sfs = require('./shaders/marbel.frag');

const fvs = require('./shaders/floor/floor.vert');
const ffs = require('./shaders/floor/floor.frag');

let box, skyBox;

require('../scss/style.scss');

let manager;
let controlsManager;
let interfaceManager;
let audioManager;

// let stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.domElement);

// General
Store.res = {};
Store.res.width = window.innerWidth;
Store.res.height = window.innerHeight;

window.hasNativeWebVRImplementation = !!navigator.getVRDisplays || !!navigator.getVRDevices;

window.WebVRConfig = window.WebVRConfig || {
    BUFFER_SCALE: 0.5,
    CARDBOARD_UI_DISABLED: true,
    ROTATE_INSTRUCTIONS_DISABLED: true,
    MOUSE_KEYBOARD_CONTROLS_DISABLED: false,
};

if (/(iphone|ipod|ipad).*os.*(7|8|9)/i.test(navigator.userAgent)) {
  window.WebVRConfig.BUFFER_SCALE = 1 / window.devicePixelRatio;
}

const init = () => {

    Store.container = document.getElementById('webgl-container');
    Store.renderer = new THREE.WebGLRenderer({
        antialise: true,
    });
    Store.renderer.setPixelRatio( window.devicePixelRatio );
    Store.renderer.setSize(Store.res.width, Store.res.height);
    Store.renderer.setClearColor(0x7b7b7b)

    Store.container.appendChild(Store.renderer.domElement);

    Store.scene = new THREE.Scene();

    Store.camera = new THREE.PerspectiveCamera(60, Store.res.width/Store.res.height, 0.1, 1000);
    Store.scene.add(Store.camera);

    Store.controls = new THREE.VRControls( Store.camera );
    Store.controls.standing = true;
	Store.effect = new THREE.VREffect( Store.renderer );


    // Kickoff all managers
    let params = {
        hideButton: false, // Default: false.
        isUndistorted: false, // Default: false.
    };

    // Renderer manager
    manager = new WebVRManager(Store.renderer, Store.effect, params);

    // UI manager
    interfaceManager = new InterfaceManager(0);

    // Controls manager
    controlsManager = new ControlsManager();
    controlsManager.setControlsType(interfaceManager.connect);

    // Audio manager
    audioManager = new AudioManager();

    // Insert Particles
    let partCount = 10000;
    let distance =  3;

    let uniforms = {
        time: {
            type: 'f',
            value: 0,
        }
    }

    let bufferMaterial = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms,
        side: THREE.DoubleSide,
    })


    let positions = new Float32Array( partCount * 3 );
    for ( let i = 0; i < partCount * 3; i += 3 ) {
            positions[i + 0] = Math.random() * distance - distance/2;
            positions[i + 1] = Math.random() * distance - distance/2;
            positions[i + 2] = Math.random() * distance - distance/2;
    }
    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

    Particles = new THREE.Points(
        geometry,
        bufferMaterial
    )

    // scene.add(Particles);

    // Insert Test Object
    Store.targets = new THREE.Group();
    Store.shadowTargets = [];
    Store.scene.add(Store.targets);

    Store.textureLoader = new THREE.TextureLoader(Store.loadingManager);
    let textToLabelLoader = new TextToLabel(Store.loadingManager);

    let sUniforms = {
        tex: {
            type: 't',
            value: Store.textureLoader.load('assets/studio_light.jpg'),
        },
        tNormal: {
            type: 't',
            value: Store.textureLoader.load('assets/normal.jpg'),
        },
        res: {
            type: 'v2',
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        }
    }

    let studioMaterial = new THREE.ShaderMaterial({
        vertexShader: svs,
        fragmentShader: sfs,
        uniforms: sUniforms,
        shading: THREE.SmoothShading,
    })

    studioMaterial.uniforms.tex.value.wrapS = 
    studioMaterial.uniforms.tex.value.wrapT = 
    THREE.ClampToEdgeWrapping;

    box = new THREE.Mesh(
        // new THREE.TorusKnotBufferGeometry( 0.5, 0.15, 100, 16 ),
        new THREE.BoxBufferGeometry(1,1,1),
        studioMaterial,
    )

    box.toggle = function(){};

    box.name = 'Exhibit A: Steps';
    box.labelTexture = textToLabelLoader.create(box.name);
    box.isTriggered = false;
    box.position.z = -6.4;
    box.position.y = 1.8;
    Store.shadowTargets.push(box);
    Store.targets.add(box);

    audioManager.create(box, 'assets/audio/footsteps_concrete.ogg');

    let sphere = new THREE.Mesh(
        // new THREE.TorusKnotBufferGeometry( 0.5, 0.15, 100, 16 ),
        new THREE.SphereBufferGeometry(0.5,32,32),
        studioMaterial,
    )

    sphere.toggle = function(){};

    sphere.name = 'Exhibit B: Storm';
    sphere.labelTexture = textToLabelLoader.create(sphere.name);
    sphere.isTriggered = false;
    sphere.position.z = 6.4;
    sphere.position.y = 1.8;
    Store.shadowTargets.push(sphere);
    Store.targets.add(sphere);

    audioManager.create(sphere, 'assets/audio/thunder_rain.ogg');

    // Env Model
    var loader = new THREE.JSONLoader(Store.loadingManager);
    loader.load('assets/studio_hires.json', (geometry) => {
        let studio = new THREE.Mesh(
            new THREE.BufferGeometry().fromGeometry(geometry),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFFF,
                map: Store.textureLoader.load('assets/studio_hi_res_tiles.jpg'),
            })
        )
        studio.name = "AO Test object";
        Store.scene.add(studio);
        studio.rotation.y = Math.PI/2;
        studio.position.y = 1.2;
    })
    
    // Needs specular & texture map and shadows on vive (and lower devices?)
    let tiles = {
        diffuse: 'assets/tiles/diffuse.png',
        normal: 'assets/tiles/normal.png',
        specular: 'assets/tiles/specular.png',
        repeatW: 6,
        repeatH: 6,
    }

    let floorUniforms = {
        shininess: {
            type: 'f',
            value:0.2,
        },
        repeatUV: {
            type: 'v2',
            value: new THREE.Vector2(tiles.repeatW,tiles.repeatH),
        },
        diffuseMap: {
            type: 't',
            value: Store.textureLoader.load(tiles.diffuse), // add diffuseMap
        },
        specularMap: {
            type: 't',
            value: Store.textureLoader.load(tiles.specular), // add specularMap
        },
        normalMap: {
            type: 't',
            value: Store.textureLoader.load(tiles.normal), // add normalMap
        },
    }

    let floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(22.6,15,1),
        new THREE.ShaderMaterial({
                vertexShader: fvs,
                fragmentShader: ffs,
                uniforms: floorUniforms,
            })
    )

    floor.material.receiveShadow = true;

    floor.material.uniforms.normalMap.value.wrapS =
    floor.material.uniforms.normalMap.value.wrapT =
    floor.material.uniforms.diffuseMap.value.wrapS =
    floor.material.uniforms.diffuseMap.value.wrapT =
    floor.material.uniforms.specularMap.value.wrapS =
    floor.material.uniforms.specularMap.value.wrapT =
    THREE.RepeatWrapping;

    floor.name = "floor";
    floor.labelTexture = textToLabelLoader.create(floor.name);
    floor.rotation.x = -Math.PI / 2;
    floor.rotation.z = -Math.PI/2;
    floor.position.y = -1.4;
    Store.targets.add(floor);

    // Pilar
    loader.load('assets/pilar.json', (geometry) => {
        let pilar = new THREE.Mesh(
            new THREE.BufferGeometry().fromGeometry(geometry),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                map: Store.textureLoader.load('assets/pilar.png'),
            })
        )

        let pilarShadow = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(7.2,7.2,1),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                map: Store.textureLoader.load('assets/pilar_shadow.png'),
                transparent: true,
                side: THREE.DoubleSide,
            })
        )
        pilarShadow.position.y = -1.23;
        pilarShadow.rotation.x = Math.PI/2;
        pilar.add(pilarShadow);
        pilar.position.z = box.position.z;
        Store.shadowTargets.push(pilar);
        Store.scene.add(pilar);

        let spherePilar = pilar.clone();
        spherePilar.position.z = sphere.position.z;
        Store.shadowTargets.push(spherePilar);
        Store.scene.add(spherePilar);
    });
    
    bindEventListeners();

};

const start = () => {
    console.log('Starting experience')
    // GearVR Hack/Workaround
    if ( navigator.getVRDisplays ){
        navigator.getVRDisplays().then((displays) => {
            Store.vrDisplay = displays[0];
            if ( displays.length > 0 ){
                if ( displays[0].displayName.indexOf('GearVR') !== -1 ){
                    displays[0].requestPresent([{source: Store.renderer.domElement}]).then(() => {
                        animate();
                    });
                } else {
                    animate();
                }
            }
        })
    }
}

Store.loadingManager = new LoadingManagerHelper(start);

const bindEventListeners = () => {
    window.addEventListener('resize', onWindowResize, false);
}

const onWindowResize = () => {
    Store.res.width = window.innerWidth;
    Store.res.height = window.innerHeight;

    Store.effect.setSize(Store.res.width, Store.res.height);
    Store.camera.aspect = Store.res.width/Store.res.height;
    Store.camera.updateProjectionMatrix();
}

const render = () => {
    manager.render(Store.scene, Store.camera);
}

const update = () => {
    Store.controls.update();
    controlsManager.update();
    // testMesh.rotation.x += 0.02;
    // testMesh.rotation.y += 0.02;
    // Particles.material.uniforms.time.value += 0.0002;
}

const animate = () => {
    // stats.begin();
    update();
    render();
    // stats.end();
    Store.vrDisplay.requestAnimationFrame(animate);
}

window.onload = () => {
    Store.loadingManager.connect(init);
};

