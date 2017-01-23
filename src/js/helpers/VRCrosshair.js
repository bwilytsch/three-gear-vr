'use strict';
const iconURL = 'assets/oculus.svg';
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { TweenMax } from 'gsap';
import Compass from './VRCompass';
import ViveControls from './controls/ViveControls';
import CrosshairControls from './controls/CrosshairControls';
import Stats from 'stats.js';
import Store from './globalStorage';

require('es6-promise-polyfill');

let vrDisplay,
    INTERSECTED;

const PI = Math.PI;

let dt = 0;

const calcTheta = (vector) => {
    return Math.atan2(vector.x,vector.z) + PI;
}

class GearVR {
    constructor(
        source,
        camera,
        scene,
        targets,
        params = {
            hasCrossHair: true,
            hasViveControls: true,
            path: '',
        }
    ){
        
        console.log('gearvr legacy triggered');

        this.source = source;
        this.camera = camera;
        this.scene = scene
        this.targets = targets;
        this.hasGamePad = false;
        this.gamePad = null;
        this.clock = new THREE.Clock();
        this.clock.start();

        this.compass = new Compass(this.camera, this.scene);
        this.newCross = new CrosshairControls();

        // Create Oculus Icon
        let icon = document.createElement('a');
        icon.href = "ovrweb:" + window.location.href.toString() + params.path;
        icon.style.position = "fixed";
        icon.style.width = "24px";
        icon.style.height = "24px";
        icon.style.top = '16px';
        icon.style.right = '16px';
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

        // Bind methods
        this.animate = this.animate.bind(this);
        this.connect = this.connect.bind(this);
        this.start = this.start.bind(this);
        this.startGear = this.startGear.bind(this);
        this.start2D = this.start2D.bind(this);
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
                    switch(true){
                        case displays[0].displayName.indexOf('GearVR') !== -1:
                            this.startGear();
                            break;
                        case displays[0].displayName.indexOf('Vive') !== -1:
                            // Add Vive Controllers;
                            this.ViveControls = new ViveControls();
                            this.start();
                            break;
                        case displays[0].displayName.indexOf('Mouse') !== -1:
                            let container = document.createElement('div');
                            container.id = "compass-container";
                            let compassText = document.createElement('div');
                            compassText.id = "compass-text";
                            let compassDir = document.createElement('div');
                            compassDir.id = "compass-direction";
                            let compassArrow = document.createElement('div');
                            compassArrow.id = "compass-arrow";
                            container.appendChild(compassArrow);
                            container.appendChild(compassDir);
                            container.appendChild(compassText);
                            document.body.appendChild(container);
                            this.start2D();
                            break;
                        default:
                            this.start();
                    }
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
    startGear(){
        if ( vrDisplay === undefined ) return;
        vrDisplay.requestPresent([{source: this.source.domElement}]).then(() => {
            vrDisplay.requestAnimationFrame(this.animateVR); 
        });
    }
    start2D(){
        this.compass.deviceType = '2D';
        vrDisplay.requestAnimationFrame(this.animate);
    }
    start(){
        if ( vrDisplay === undefined ) return;
        vrDisplay.requestAnimationFrame(this.animateVR);
    }
    updateGamePad(dt){
        let activePad = navigator.getGamepads()[this.gamePad];
        if ( activePad.buttons[0].pressed &&  Date.now() - this.controllerState.lastEvent > 320){
            console.log('pressed');
            if (INTERSECTED){
                this.activateObject();
            }
            this.controllerState.lastEvent = Date.now();
        }
    }
    animate(){
        stats.begin();
        this.update();
        this.render();
        this.newCross.update();
        stats.end();
        requestAnimationFrame(this.animate);
    }
    animateVR(){

        stats.begin();

        this.update();
        this.render();
        this.textureRenderer.render(this.stage);

        if ( this.hasViveControls ){
            this.ViveControls.update();
        }

        if ( this.hasGamePad ){
            this.updateGamePad();
        }
        if ( this.hasCrossHair ){

            // this.drawCrosshair();

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {

                if ( intersects[0].object.name === "floor"){

                    let vector = this.camera.getWorldDirection();
                    let theta = calcTheta(vector);
                    let point = intersects[0].point;

                    this.compass.update(theta, point);

                    if ( point.distanceTo(this.camera.position) < 4.2){
                        if (!this.compass.state.isVisible) this.compass.show();
                    } else {
                        if (this.compass.state.isVisible) this.compass.hide();
                    }
                }

                if ( INTERSECTED != intersects[ 0 ].object ) {
                    // if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                    INTERSECTED = intersects[ 0 ].object;
                    // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    if ( intersects[0].object.name !== "floor" ){
                        this.showLoader();
                    } else {
                        this.hideLoader();
                    }
                }
            } else {
                if ( INTERSECTED ){

                    if ( typeof INTERSECTED.reset === 'function') {
                        INTERSECTED.reset();
                    }

                    this.hideLoader();
                    INTERSECTED = undefined;
                }
            }

        }

        stats.end();

        vrDisplay.requestAnimationFrame(this.animateVR);
    }
}

export default GearVR;