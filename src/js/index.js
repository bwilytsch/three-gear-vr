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

// CUSTOM SHADERS
let Particles;
const vs = require('./shaders/shader.vert');
const fs = require('./shaders/shader.frag');

const svs = require('./shaders/marbel.vert');
const sfs = require('./shaders/marbel.frag');

let renderer, scene,camera, testMesh, skyBox, container, targets;
let effect, controls;

require('../scss/style.scss');

let manager;
let controlsManager;
let interfaceManager;

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.domElement);

// General
Store.res = {};
Store.res.width = window.innerWidth;
Store.res.height = window.innerHeight;

window.hasNativeWebVRImplementation = !!navigator.getVRDisplays || !!navigator.getVRDevices;

window.WebVRConfig = window.WebVRConfig || {
    BUFFER_SCALE: 0.5,
    CARDBOARD_UI_DISABLED: false,
    ROTATE_INSTRUCTIONS_DISABLED: true,
    MOUSE_KEYBOARD_CONTROLS_DISABLED: false,
};

if (/(iphone|ipod|ipad).*os.*(7|8|9)/i.test(navigator.userAgent)) {
  window.WebVRConfig.BUFFER_SCALE = 1 / window.devicePixelRatio;
}

const init = () => {

    Store.container = document.getElementById('webgl-container');
    renderer = new THREE.WebGLRenderer({
        antialise: true,
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(Store.res.width, Store.res.height);
    renderer.setClearColor(0x7b7b7b)

    Store.container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, Store.res.width/Store.res.height, 0.01, 1000);
    scene.add(camera);

    // Store obnjects locally
    Store.renderer = renderer;
    Store.scene = scene;
    Store.camera = camera;

    controls = new THREE.VRControls( camera );
    controls.standing = true;
	effect = new THREE.VREffect( renderer );

    Store.controls = controls;
    Store.effect = effect;

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
    targets = new THREE.Group();
    scene.add(targets);

    Store.textureLoader = new THREE.TextureLoader();

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

    var loader = new THREE.JSONLoader();
    loader.load('assets/studio_hires.json', (geometry) => {
        console.log('add AO object.');
        let tempMesh = new THREE.Mesh(
            new THREE.BufferGeometry().fromGeometry(geometry),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFFF,
                map: Store.textureLoader.load('assets/studio_hi_res_tiles.jpg'),
            })
        )
        tempMesh.name = "AO Test object";
        scene.add(tempMesh);
        tempMesh.position.y = 1.2;
    })

    testMesh = new THREE.Mesh(
        // new THREE.TorusKnotBufferGeometry( 0.5, 0.15, 100, 16 ),
        new THREE.BoxBufferGeometry(1,1,1),
        studioMaterial,
    )

    testMesh.trigger = function(){
        console.log(this.name + ' was triggered');
    }

    testMesh.reset = function(){
        console.log(this.name + ' was reset');
    }

    testMesh.name = 'Exhibit A: Marbel Bock 675';
    testMesh.position.z = -4;
    testMesh.position.y = 1.2;
    targets.add(testMesh);
    
    // Needs specular & texture map and shadows on vive (and lower devices?)

    let floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(22.6,15,1),
        new THREE.MeshBasicMaterial({
            color: 0x151515,
        })
    )

    floor.name = "floor";
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.4;
    targets.add(floor);

    Store.targets = targets;
    
    bindEventListeners();
    start();
}

const start = () => {
    let params = {
        hideButton: false, // Default: false.
        isUndistorted: false, // Default: false.
    };

    manager = new WebVRManager(renderer, effect, params);

    // UI manager
    interfaceManager = new InterfaceManager(0);

    // Controls manager
    controlsManager = new ControlsManager();
    controlsManager.setControlsType(interfaceManager.connect);

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

const bindEventListeners = () => {
    window.addEventListener('resize', onWindowResize, false);
}

const onWindowResize = () => {
    Store.res.width = window.innerWidth;
    Store.res.height = window.innerHeight;

    effect.setSize(Store.res.width, Store.res.height);
    camera.aspect = Store.res.width/Store.res.height;
    camera.updateProjectionMatrix();
}

const render = () => {
    manager.render(scene, camera);
}

const update = () => {
    controls.update();
    controlsManager.update();
    testMesh.rotation.x += 0.02;
    testMesh.rotation.y += 0.02;
    // Particles.material.uniforms.time.value += 0.0002;
}

const animate = () => {
    stats.begin();
    render();
    update();
    stats.end();
    Store.vrDisplay.requestAnimationFrame(animate);
}

window.onload = () => {
    init();
}

