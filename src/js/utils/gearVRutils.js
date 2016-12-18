'use strict';
const iconURL = 'assets/oculus.svg';
import * as THREE from 'three';

require('es6-promise-polyfill');

let vrDisplay,
    INTERSECTED;

class GearVR {
    constructor(source, camera, targets, params = {
        hasCrossHair: true,
        path: '',
    }){

        this.source = source;
        this.camera = camera;
        this.targets = targets;
        this.hasGamePad = false;
        this.hasCrossHair = params.hasCrossHair;
        this.gamePad = null;
        this.raycaster = new THREE.Raycaster();

        // Create Oculus Icon
        let icon = document.createElement('a');
        icon.href = "ovrweb:" + window.location.href.toString() + params.path;
        icon.style.position = "fixed";
        icon.style.width = "24px";
        icon.style.height = "24px";
        icon.style.bottom = '24px';
        icon.style.right = '24px';
        icon.style.display = "block";
        icon.style.cursor = "pointer";

        this.update = null;
        this.render = null;

        let iconIMG = new Image();
        iconIMG.onload = () => {
            icon.appendChild(iconIMG);
            document.body.appendChild(icon);
        }
        iconIMG.crossOrigin = '';
        iconIMG.src = iconURL;

        // Crosshair
        let crosshair = new THREE.Mesh(
            new THREE.RingGeometry( 0.02, 0.04, 32 ),
            new THREE.MeshBasicMaterial( {
                color: 0xffffff,
                opacity: 0.5,
                transparent: true
            } )
        )
        crosshair.position.z = - 2;
        camera.add(crosshair);

                // Bind methods
        this.animate = this.animate.bind(this);
        this.connect = this.connect.bind(this);
        this.start = this.start.bind(this);
        this.updateGamePad = this.updateGamePad.bind(this);
        this.animateVR = this.animateVR.bind(this);


        // Connect controller
        this.controller = null;
        this.controllerState = {
            lastButtons: [],
            lastAxes: [],
            lastEvent: Date.now(),
        };

        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for ( var i = 0; i < gamepads.length; i++ ){
            if ( gamepads[i] === undefined || gamepads[i] === null ) return;
            let activePad = gamepads[i];
            if ( activePad.id.includes("Gear VR") ){
                this.gamePad = i;
                this.hasGamePad = true;
                console.log( "Gear VR GamePad connected and active" );
            }
        }

    }
    connect(render, update){
        this.update = update;
        this.render = render;
        if ( navigator.getVRDisplays ){
            navigator.getVRDisplays().then((displays) => {
                if ( displays.length > 0 ){
                    vrDisplay = displays[0];
                    this.start();
                    // Vive kickoff
                }
            }).catch((err) => {
                throw err;
            })
        } else {
            // WebVR not supported
            // Start normal experience
            requestAnimationFrame(this.animate);
        }
    }
    start(){
        if ( vrDisplay === undefined ) return;
        vrDisplay.requestPresent([{source: this.source.domElement}]).then(() => {
            vrDisplay.requestAnimationFrame(this.animateVR);
        });
    }
    updateGamePad(dt){
        let activePad = navigator.getGamepads()[this.gamePad];
        if ( activePad.buttons[0].pressed &&  Date.now() - this.controllerState.lastEvent > 320){
            console.log('pressed');
            if (INTERSECTED){
                INTERSECTED.material.color.setHex( 0xff0000 );
            }
            this.controllerState.lastEvent = Date.now();
        }
    }
    animate(){
        this.update();
        this.render();
        if ( this.hasCrossHair ){

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {
					if ( INTERSECTED != intersects[ 0 ].object ) {
						if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                        INTERSECTED.material.color.setHex( 0xff0000 );
					}
				} else {
					if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					INTERSECTED = undefined;
				}

        }
        requestAnimationFrame(this.animate);
    }
    animateVR(){
        this.update();
        this.render();
        if ( this.hasGamePad ){
            this.updateGamePad();
        }
        if ( this.hasCrossHair ){

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {
					if ( INTERSECTED != intersects[ 0 ].object ) {
						if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
						INTERSECTED = intersects[ 0 ].object;
						INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
					}
				} else {
					if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					INTERSECTED = undefined;
				}

        }
        vrDisplay.requestAnimationFrame(this.animateVR);
    }
}

export default GearVR;