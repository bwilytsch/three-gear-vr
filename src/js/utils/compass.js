'use strict';
import * as THREE from 'three';
import { TweenMax, TimelineMax } from 'gsap';

const PI = Math.PI;

const getRadians = (angle) => {
    return PI / 180 * angle;
}

const getDegrees = (angle) => {
    return angle / PI * 180;
}

let degrees = 0;

const cfs = require('../shaders/compass.frag');
const cvs = require('../shaders/compass.vert');


// Rewrite getting the text parent container of the compass

class Compass {
    constructor(camera, scene, floor){
        this.camera = camera;
        this.scene = scene;
        this.deviceType = null;

        this.size = 2;

        this.state = {
            isVisible: false,
        }

        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.showCSSLabel = this.showCSSLabel.bind(this);
        this.hideCSSLabel = this.hideCSSLabel.bind(this);
        this.getCSSContainer = this.getCSSContainer.bind(this);

        this.getCSSContainer();

        // Create shape
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512 * this.size;
        this.canvas.height = 512 * this.size;
        this.canvas.className = 'compass';
        this.ctx = this.canvas.getContext('2d');

         // Compass Parameters
        this.radius = 24;
        this.color = '#FF0000';
        this.lineWidth = 8;
        this.outerRadius = 0;
        this.outerRadiusMin = 0;
        this.outerRadiusMax = this.canvas.width/2 - this.lineWidth;
        this.animationSpeed = 0.3;
        this.coneStart = 0;
        this.coneEnd = PI/2;

        this.UI = new THREE.Object3D();

        let textureLoader = new THREE.TextureLoader();

        let uniformsUI = {
            circleTex: {
                type: 't',
                value: textureLoader.load('assets/outerCompass.png')
            },
            triangleTex: {
                type: 't',
                value: textureLoader.load('assets/innerCompass.png')
            },
            angle: {
                type: 'f',
                value: 0,
            },
            opacity: {
                type: 'f',
                value: 0,
            }
        }

        let circle = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size,1),
            new THREE.ShaderMaterial({
                transparent: true,
                vertexShader: cvs,
                fragmentShader: cfs,
                uniforms: uniformsUI,
                side: THREE.DoubleSide,
            })
        )

        this.UI.add(circle);

        this.UI.position.z = -2;
        this.UI.position.y = -1.1;
        this.UI.rotation.x = -PI/2;

        this.scene.add(this.UI);

    }
    getCSSContainer(){
        if ( this.textContainer === null || this.textContainer === undefined ) {
            console.log(this.textContainer);
            this.textContainer = document.getElementById('compass-text');
        }
    }
    showCSSLabel(text){
        console.log('expand CSS label');
        this.getCSSContainer();
        this.textContainer.innerHTML = text;
        TweenMax.to('#compass-container', 0.3, {width: this.textContainer.clientWidth + 32, onComplete: () => {
            TweenMax.to('#compass-text', 0.3, {opacity: 1, delay: 0.2});
        }});
    }
    hideCSSLabel(){
        console.log('collapse CSS label');
        this.textContainer.innerHTML = '';
        TweenMax.to('#compass-container', 0.16, { width: 36});
        TweenMax.to('#compass-text', 0.16, {opacity: 0});
    }
    toggleVisibility(){
        this.state.isVisible = !this.state.isVisible;
        console.log(this.state.isVisible);
    }
    show(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.UI.children[0].material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    hide(){
        console.log('hide compass');
        this.toggleVisibility();
        TweenMax.to(this.UI.children[0].material.uniforms.opacity, this.animationSpeed/2, {value: 0});
    }
    update(angle, point){

        if (point) {
            this.UI.position.x = point.x;
            this.UI.position.z = point.z;
        }

        this.UI.children[0].material.uniforms.angle.value = -angle;

    }
    updateCSS(angle){
        degrees = getDegrees(angle);
        TweenMax.set('#compass-direction', { rotation: degrees });
    }
}

export default Compass;