'use strict';
const iconURL = 'assets/oculus.svg';
import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { TweenMax } from 'gsap';
import Compass from './compass';
import Stats from 'stats.js';

require('es6-promise-polyfill');

let vrDisplay,
    INTERSECTED;

const PI = Math.PI;

let dt = 0;

let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.domElement);

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
            path: '',
        }
    ){
        this.source = source;
        this.camera = camera;
        this.scene = scene
        this.targets = targets;
        this.hasGamePad = false;
        this.gamePad = null;
        this.clock = new THREE.Clock();
        this.clock.start();

        this.compass = new Compass(this.camera, this.scene);

        this.hasCrossHair = params.hasCrossHair;
        this.crossHair = {
            hasIntersection: false,
            isTriggered: false,
            radius: 256,
            progress: 0,
            startAngle: 0,
            endAngle: PI/2,
            loaderRadius: 0.10,
        }

        this.textureRenderer = new PIXI.WebGLRenderer(512,512, {
            transparent: true,
            // preserveDrawingBuffer: true,
            // clearBeforeRender: false,
        }); 
        this.stage = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.texture = new THREE.Texture(this.textureRenderer.view);

        this.stage.addChild(this.graphics);


        // this.canvas = document.createElement('canvas');
        // this.ctx = this.canvas.getContext('2d');
        // this.texture = new THREE.Texture(this.canvas);
        
        this.raycaster = new THREE.Raycaster();

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

        // Crosshair
        // this.canvas.width = 512;
        // this.canvas.height = 512;

        // this.canvas.className = 'crosshair';
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
        this.drawCrosshair();

        // Bind methods
        this.animate = this.animate.bind(this);
        this.connect = this.connect.bind(this);
        this.start = this.start.bind(this);
        this.startGear = this.startGear.bind(this);
        this.start2D = this.start2D.bind(this);
        this.updateGamePad = this.updateGamePad.bind(this);
        this.animateVR = this.animateVR.bind(this);
        this.drawCrosshair = this.drawCrosshair.bind(this);
        this.activateObject = this.activateObject.bind(this);
        this.showLoader = this.showLoader.bind(this);
        this.hideLoader = this.hideLoader.bind(this);
        this.drawPercentage = this.drawPercentage.bind(this);

        this.progressAnimation = new TimelineMax({pause: true, onUpdate: this.drawPercentage, onComplete: this.activateObject});
        this.progressAnimation.fromTo(this.crossHair, 1, {progress: 0}, {progress: 1} )


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
                            this.start();
                            break;
                        case displays[0].displayName.indexOf('Mouse') !== -1:
                            // let container = document.createElement('div');
                            // container.id = "compass-container";
                            // let compassText = document.createElement('div');
                            // compassText.id = "compass-text";
                            // container.appendChild(compassText);
                            // container.appendChild(this.compass.canvas);
                            // document.body.appendChild(container);
                            // this.compass.lineWidth = 2;
                            // this.compass.outerRadiusMax = 30;
                            // this.compass.radius = 4;
                            // this.compass.canvas.width = 64;
                            // this.compass.canvas.height = 64;
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
    drawCrosshair(){

        this.graphics.clear();

        if ( this.crossHair.hasIntersection ){

            // Draw loader Base
            this.graphics.lineStyle(this.crossHair.radius * 0.24, 0xFFFFFF, 0.5);
            this.graphics.arc(this.crossHair.radius,this.crossHair.radius,this.crossHair.radius * this.crossHair.loaderRadius, 0, PI * 2 + 0.01);
            this.graphics.closePath();

        }

        // Draw Base Cursor
        this.graphics.beginFill(0xFF0000,1);
        this.graphics.lineStyle(0, 0xFFFFFF, 0);
        this.graphics.drawCircle(this.crossHair.radius, this.crossHair.radius, this.crossHair.radius * 0.24);
        this.graphics.endFill();

        console.log('drawing circle');

        this.texture.needsUpdate = true;

    }
    drawPercentage(){
        this.drawCrosshair();
        
        this.graphics.lineStyle(this.crossHair.radius * 0.24, 0xFFFFFF, 1);
        this.graphics.arc(this.crossHair.radius,this.crossHair.radius,this.crossHair.radius * this.crossHair.loaderRadius, -PI/2, PI * 2  * this.crossHair.progress - PI/2);
        
    }
    showLoader(){
        console.log('show loader');
        this.crossHair.hasIntersection = true;
        this.crossHair.isTriggered = false;
        this.clock.start();
        TweenMax.to(this.crossHair, 0.3, { loaderRadius: 0.48, onUpdate: this.drawCrosshair, onComplete: () => {
            this.progressAnimation.restart();
        } } );
    }
    hideLoader(){
        console.log('hide loader');
        this.crossHair.isTriggered = true;
        this.clock.stop();
        this.progressAnimation.pause();
        TweenMax.to(this.crossHair, 0.16, { loaderRadius: 0.08, onComplete: () => {
            this.crossHair.hasIntersection = false;
            this.crossHair.isTriggered = false;
            this.drawCrosshair();
        }, onUpdate: this.drawCrosshair } )
    }
    activateObject(){
        if ( INTERSECTED ){
            if ( typeof INTERSECTED.trigger === 'function' ){
                INTERSECTED.trigger();
            }
            this.hideLoader();
        }
    }
    animate(){
        stats.begin();
        this.update();
        this.render();
        this.textureRenderer.render(this.stage);

        if ( this.hasCrossHair ){

            let vector = this.camera.getWorldDirection();
            let theta = calcTheta(vector);

            // this.drawCrosshair();
            this.compass.update(theta);

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            if ( intersects.length > 0 ) {

                if ( INTERSECTED != intersects[ 0 ].object ) {
                    if ( INTERSECTED );
                    INTERSECTED = intersects[ 0 ].object;
                    if ( intersects[0].object.name !== "floor" ){
                        this.showLoader();
                        // this.compass.showCSSLabel(INTERSECTED.name);
                    } else {
                        this.hideLoader();
                        // this.compass.hideCSSLabel();
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
        requestAnimationFrame(this.animate);
    }
    animateVR(){

        stats.begin();

        this.update();
        this.render();
        this.textureRenderer.render(this.stage);

        if ( this.hasGamePad ){
            this.updateGamePad();
        }
        if ( this.hasCrossHair ){

            // this.drawCrosshair();

            this.raycaster.setFromCamera({x: 0, y: 0}, this.camera);
            let intersects = this.raycaster.intersectObjects(this.targets.children);

            let vector = this.camera.getWorldDirection();
            let theta = calcTheta(vector);
            // let point = intersects[0].point;

            this.compass.update(theta);

            if ( intersects.length > 0 ) {

                if ( intersects[0].object.name === "floor"){

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