'use strict';
// Start web experience
// Include Gamepad Controls
// Controller with crosshair

// GEARVR
import GearVR from './utils/gearVRutils';
let gearVR = null;

// THREEJS
import * as THREE from 'three';
import VRControls from 'three/examples/js/controls/VRControls';
import VREffect from 'three/examples/js/effects/VREffect';

let renderer, scene,camera, testMesh, skyBox, container;
let effect, controls;

// General
require('../scss/style.scss');
let _WIDTH = window.innerWidth,
    _HEIGHT = window.innerHeight;

const init = () => {

    container = document.getElementById('webgl-container');
    renderer = new THREE.WebGLRenderer({
        antialise: true
    });
    renderer.pixelRation = window.devicePixelRatio;
    renderer.setSize(_WIDTH, _HEIGHT);
    renderer.setClearColor(0x000000)

    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, _WIDTH/_HEIGHT, 0.01, 1000);
    scene.add(camera);

    controls = new THREE.VRControls( camera );
    controls.standing = true;
	effect = new THREE.VREffect( renderer );

    // Create skyBox
    skyBox = new THREE.Mesh(
        new THREE.BoxBufferGeometry(24,24,24,24,24,24),
        new THREE.MeshBasicMaterial({
            wireframe: true,
            color: 0x333333,
        })
    )
    scene.add(skyBox);

    // Insert Test Object
    testMesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1,1,1),
        new THREE.MeshBasicMaterial({
            color: 0xFF0000,
        })
    )

    testMesh.position.z = -4;
    scene.add(testMesh);

    // Add GearVR support
    gearVR = new GearVR(renderer);
    gearVR.connect(render, update);
    
    bindEventListeners();

}

const bindEventListeners = () => {
    window.addEventListener('resize', onWindowResize, false);
}

const onWindowResize = () => {
    _WIDTH = window.innerWidth;
    _HEIGHT = window.innerHeight;

    effect.setSize(_WIDTH, _HEIGHT);
    camera.aspect = _WIDTH/_HEIGHT;
    camera.updateProjectionMatrix();
}

const render = () => {
    effect.render(scene, camera);
}

const update = () => {
    controls.update();
    testMesh.rotation.x += 0.02;
    testMesh.rotation.y += 0.02;
}

window.onload = () => {
    init();
}