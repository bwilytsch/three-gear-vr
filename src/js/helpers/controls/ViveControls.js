'use strict';

// Gets trigger und triggerdown event
// Raycast position via controller line

// Global Storage
import Store from '../globalStorage';
import * as THREE from 'three';

const OBJLoader = require('three/examples/js/loaders/OBJLoader.js');
const ViveController = require('three/examples/js/vr/ViveController.js');

let tempMatrix = null,
    raycaster = new THREE.Raycaster();

const getIntersections = (controller) => {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld);
    raycaster.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
    if ( Scene.target !== undefined ) {
        return raycaster.intersectObjects(Scene.target.children);
    } else {
        return [];
    }
}

const intersectObjects = (controller) => {
    // Do not highlight if already selected
    if ( controller.userData.selected !== undefined ){return};

    let line = controller.getObjectByName('line');
    let intersections = getIntersections(controller);

    if (intersections.length > 0) {
        let intersection = intersections[0];
        let object = intersection.object;
        if ( !object.isActive ){
            intersected.push(object);
        }
        line.scale.z = intersection.distance;
    } else {
        line.scale.z = 5;
        cleanIntersected();
    }
}

const cleanIntersected = () => {
    while ( intersected.length ) {
        var object = intersected.pop();
    }
}

class ViveControls {
    constructor(number){

        this.controllers = [];

        let loader = new THREE.OBJLoader();
        loader.setPath('./assets/vive-controller/');
        loader.load('vr_controller_vive_1_5.obj', (object)=>{
            let textureLoader = new THREE.TextureLoader();
            textureLoader.setPath('./assets/vive-controller/');
            let controller = object.children[0];
            controller.material.map = textureLoader.load('onepointfive_texture.png');
            controller.material.specularMap = textureLoader.load('onepointfive_spec.png');

            // Add decteion lines
            let lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3(0,0,0));
            lineGeometry.vertices.push(new THREE.Vector3(0,0,-1));

            var line = new THREE.Line(lineGeometry);
            line.name = 'line';
            line.scale.z = 5;

            for (var i = 0; i < number - 1; i++ ){
                this.controllers[i] = new THREE.ViveController(i);
                console.log(this.controllers[i]);
                this.controllers[i].standingMatrix = Store.controls.getStandingMatrix();
                this.controllers[i].add(object.clone());
                this.controllers[i].add(line.clone());
                Store.scene.add(this.controllers[i]);
            }

            console.log(this.controllers);

        });

        // Add light for specular map
        Store.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
        var light = new THREE.SpotLight( 0xffffff, 1  );
        light.position.set( 8, 8, 8 );
        light.target.position.set(0,0,0);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        
        Store.scene.add( light )

    }
    bindEvent(position, eventType, fn){
        // Expose Events
        // Event Type:
        // triggerup, triggerdown, menudown
        this.controllers[position].addEventListener(eventType, fn);
    }
    update(){
        for (var i = 0; i < this.controllers.length; i++){
            intersectObjects(this.controllers[i]);
        }
    }
}

export default ViveControls;