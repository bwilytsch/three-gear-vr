'use strict';
const iconURL = 'assets/oculus.svg';
import * as THREE from 'three';
import { TweenMax } from 'gsap';

require('es6-promise-polyfill');

let vrDisplay,
    INTERSECTED;

const PI = Math.PI;

let dt = 0;

class GearVR {
    constructor(source, camera, targets, params = {
        hasCrossHair: true,
        path: '',
    }){

        this.source = source;
        this.camera = camera;
        this.targets = targets;
        this.hasGamePad = false;
        this.gamePad = null;
        this.clock = new THREE.Clock();
        this.clock.start();

        this.hasCrossHair = params.hasCrossHair;
        this.crossHair = {
            hasIntersection: false,
            isTriggerered: false,
            startAngle: 0,
            endAngle: PI/2,
            loaderRadius: 0.10,
        }
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.texture = new THREE.Texture(this.canvas);
        
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
        this.canvas.width = 512;
        this.canvas.height = 512;

        this.canvas.className = 'crosshair';
        // document.body.appendChild(this.canvas);

        let crosshair = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 0.16, 0.16 ),
            new THREE.MeshBasicMaterial({
                map: this.texture,
                transparent: true,
                side: THREE.DoubleSide,
            })
        )

        crosshair.position.z = -2;
        this.camera.add(crosshair);

        this.updateConeAngle();
        this.drawCrosshair();

        // Bind methods
        this.animate = this.animate.bind(this);
        this.connect = this.connect.bind(this);
        this.start = this.start.bind(this);
        this.updateGamePad = this.updateGamePad.bind(this);
        this.animateVR = this.animateVR.bind(this);
        this.drawCrosshair = this.drawCrosshair.bind(this);
        this.updateConeAngle = this.updateConeAngle.bind(this);
        this.activateObject = this.activateObject.bind(this);
        this.showLoader = this.showLoader.bind(this);
        this.hideLoader = this.hideLoader.bind(this);


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
                this.activateObject();
            }
            this.controllerState.lastEvent = Date.now();
        }
    }
    updateConeAngle(angle){
        this.crossHair.startAngle = angle - PI * 2/3;
        this.crossHair.endAngle = this.crossHair.startAngle + PI / 2;
    }
    drawCrosshair(){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        // Draw Loader
        if ( this.crossHair.hasIntersection ){

            if (dt >= PI * 2 && !this.crossHair.isTriggered){
                this.activateObject();
                return;
            }

            dt = this.clock.getElapsedTime();

            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
            this.ctx.lineWidth = this.canvas.width * 0.12;
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width * this.crossHair.loaderRadius, 0, PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.strokeStyle = "#FFFFFF";
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width * this.crossHair.loaderRadius, -PI/2, dt - PI/2 );
            this.ctx.stroke();
            this.ctx.closePath();

        }

        // Draw Base Cursor
        this.ctx.beginPath();
        this.ctx.fillStyle = "#fc3e04";
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.12, 0, PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
     
        // Draw Test Cone
        // this.ctx.beginPath();
        // this.ctx.strokeStyle = '#FFFFFF';
        // this.ctx.lineWidth = this.canvas.width * 0.06;
        // this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.36, this.crossHair.startAngle, this.crossHair.endAngle)
        // this.ctx.stroke();
        // this.ctx.closePath();

        this.texture.needsUpdate = true;

    }
    showLoader(){
        console.log('show loader');
        this.crossHair.hasIntersection = true;
        this.clock.start();
        TweenMax.to(this.crossHair, 0.3, { loaderRadius: 0.24 } );
    }
    hideLoader(){
        console.log('hide loader');
        this.crossHair.isTriggered = true;
        this.clock.stop();
        TweenMax.to(this.crossHair, 0.16, { loaderRadius: 0.08, onComplete: () => {
            this.crossHair.hasIntersection = false;
            this.crossHair.isTriggered = false;
        } } )
    }
    activateObject(){
        if ( INTERSECTED )
        INTERSECTED.trigger();
        this.hideLoader();
    }
    animate(){
        this.update();
        this.render();
        if ( this.hasCrossHair ){

            this.updateConeAngle(this.camera.rotation.y);
            this.drawCrosshair();

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].object ) {
                    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                    INTERSECTED = intersects[ 0 ].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    this.showLoader();
                    this.clock.start();
                }
            } else {
                if ( INTERSECTED ) 
                INTERSECTED.reset();
                INTERSECTED = undefined;
                this.hideLoader();
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

            let vector = this.camera.getWorldDirection();
            let theta = Math.atan2(vector.x,vector.z) + PI;

            this.updateConeAngle(theta);
            this.drawCrosshair();

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {
                if ( INTERSECTED != intersects[ 0 ].object ) {
                    if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                    INTERSECTED = intersects[ 0 ].object;
                    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                    this.showLoader();
                }
            } else {
                if ( INTERSECTED ){
                    this.hideLoader();
                    INTERSECTED.reset();
                    INTERSECTED = undefined;
                }
            }

        }
        vrDisplay.requestAnimationFrame(this.animateVR);
    }
}

export default GearVR;