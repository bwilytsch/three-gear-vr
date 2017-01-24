'use strict';

// Gets trigger und triggerdown event
// Raycast position via controller line

// Global Storage
import Store from '../globalStorage';
import * as THREE from 'three';

const OBJLoader = require('three/examples/js/loaders/OBJLoader.js');
const ViveController = require('three/examples/js/vr/ViveController.js');

class ViveControls {
    constructor(){

        this.controllers = [];
        this._INTERSECTED = [];
        this.tempMatrix = new THREE.Matrix4();

        // Bind methods
        this.update = this.update.bind(this);
        this.cleanIntersected = this.cleanIntersected.bind(this);
        this.intersectObjects = this.intersectObjects.bind(this);
        this.getIntersections = this.getIntersections.bind(this);
        this.activateObject = this.activateObject.bind(this);
        this.connectGamePads = this.connectGamepads.bind(this);

        // Add light for specular map
        Store.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );
        var light = new THREE.SpotLight( 0xffffff, 1  );
        light.position.set( 8, 8, 8 );
        light.target.position.set(0,0,0);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        
        Store.scene.add( light )

        // Wait for controllers to connect
        this.connectGamepads();
        window.addEventListener('gamepadconnected', this.connectGamepads);

        // Costum Event to update Interface
        this.controlsUpdateEvent = new CustomEvent('controlsupdate', {
            'detail': {
                point: 0,
            }
        });
        
        this.controlsTriggeredEvent = new CustomEvent('controlstriggered', {
            'detail': {
                actionType: 'DEFAULT',
                objectName: '',
            }
        })

    }
    connectGamepads(){
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

        console.log(gamepads);

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

            for (var i = 0; i < gamepads.length; i++ ){

                if (gamepads[i] === null ) return;
                this.controllers[i] = new THREE.ViveController(i);
                this.controllers[i].standingMatrix = Store.controls.getStandingMatrix();
                this.controllers[i].add(object.clone());
                this.controllers[i].add(line.clone());
                Store.scene.add(this.controllers[i]);

                // Bind interface to object
                if ( i === 0 ){
                    this.controllers[i].children[0].add(Store.interface.mesh);
                }

                this.controllers[i].addEventListener('triggerdown', this.activateObject, false);

            }

        });

    }
    activateObject(){
        console.log('triggered');
        if ( this._INTERSECTED ){
            if ( typeof this._INTERSECTED.trigger === 'function' ){
                this._INTERSECTED.trigger();
            }
        }
    }
    bindEvent(position, eventType, fn){
        // Expose Events
        // Event Type:
        // triggerup, triggerdown, menudown
        this.controllers[position].addEventListener(eventType, fn);
    }
    cleanIntersected(){
        while ( this._INTERSECTED.length ) {
            var object = this._INTERSECTED.pop();
        }
    }
    intersectObjects(controller){
        // Do not highlight if already selected
        if ( controller.userData.selected !== undefined ){return};

        let line = controller.getObjectByName('line');
        let intersections = this.getIntersections(controller);

        if (intersections.length > 0) {
            if ( this._INTERSECTED != intersections[0].object ) {
                let intersection = intersections[0];
                this._INTERSECTED = intersection.object;
                line.scale.z = intersection.distance;

                this.controlsTriggeredEvent.detail.actionType = "SHOW_COMPASS";
                window.dispatchEvent(this.controlsTriggeredEvent);

            } 
        } else {
            if ( this._INTERSECTED ){

                if ( typeof this._INTERSECTED.reset === 'function') {
                    this._INTERSECTED.reset();
                }

                this.controlsTriggeredEvent.detail.actionType = "HIDE_COMPASS";
                window.dispatchEvent(this.controlsTriggeredEvent);

                this._INTERSECTED = undefined;
            }
        }
    }
    getIntersections(controller){
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        Store.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld);
        Store.raycaster.ray.direction.set(0,0,-1).applyMatrix4(this.tempMatrix);
        if ( Store.targets !== undefined ) {
            return Store.raycaster.intersectObjects(Store.targets.children);
        } else {
            return [];
        }
    }
    update(){
        for (var i = 0; i < this.controllers.length; i++){
            this.controllers[i].update();
            this.intersectObjects(this.controllers[i]);
        }
    }
}

export default ViveControls;