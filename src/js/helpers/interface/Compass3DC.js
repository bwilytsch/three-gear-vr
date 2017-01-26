'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';

// Compass Shaders
const cfs = require('../../shaders/compass/compass3DC.frag');
const cvs = require('../../shaders/compass/compass.vert');

// Label Shaders
const lfs = require('../../shaders/label/label.frag');
const lvs = require('../../shaders/label/label.vert');

const PI = Math.PI;

// Costum shader for performance increase
// Needs angle and intersection point from raycaster
// Add label helpers for Store.targets
// Intersection are made per controller

class Compass3DC {
    constructor(type){

        // Params
        this.size = 0.2;
        this.animationSpeed = 0.3;

        // Gaze or Controller based
        this.state = {
            isVisible: false,
            labelIsVisible: false,
        }

        // Bind methods
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.changeState = this.changeState.bind(this);
        this.hideCompass = this.hideCompass.bind(this);
        this.showCompass = this.showCompass.bind(this);
        this.toggleCompass = this.toggleCompass.bind(this);
        this.updateLabe = this.updateLabel.bind(this);
        this.toggleLabel = this.toggleLabel.bind(this);
        this.hideLabel = this.hideLabel.bind(this);
        this.showLabel = this.showLabel.bind(this);
        this.update = this.update.bind(this);

        // Create compass object
        this.mesh = new THREE.Object3D();

        let uniforms = {
            circleTex: {
                type: 't',
                value: Store.textureLoader.load('assets/outerCompass.png')
            },
            triangleTex: {
                type: 't',
                value: Store.textureLoader.load('assets/innerCompass.png')
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

        this.circle = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size,1),
            new THREE.ShaderMaterial({
                transparent: true,
                vertexShader: cvs,
                fragmentShader: cfs,
                uniforms,
                side: THREE.DoubleSide,
            })
        )

        this.mesh.add(this.circle);
        this.mesh.position.y = this.size/4;
        this.mesh.rotation.x = -Math.PI/2;


        // Create Label with swapable textures
         let labelUniforms = {
             tex: {
                 type: 't',
                 value: '',
             },
             opacity: {
                 type: 'f',
                 value: 0.0,
             }
         }
        
        this.label = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size/4, 1),
            new THREE.ShaderMaterial({
                vertexShader: lvs,
                fragmentShader: lfs,
                uniforms: labelUniforms,
                transparent: true,
            })
        )

        this.label.position.z = this.size/4;
        this.label.position.y = this.size/8;
        this.label.rotation.x = Math.PI/4;
        this.mesh.add(this.label);

        // Add EventListeners
        window.addEventListener('controlsupdate', this.update, false);

    }
    toggleVisibility(){
        this.state.isVisible = !this.state.isVisible;
    }
    changeState(e){
         switch(e.detail.actionType){
            case "SHOW_COMPASS":
                this.showCompass();
                break;
            case "HIDE_COMPASS":
                this.hideCompass();
                break;
            case "ADD_INTERSECTION":
                if (!this.state.isVisible) return;
                this.updateLabel(e.detail.labelTexture);
                this.showLabel();
                break;
            case "REMOVE_INTERSECTION":
                if (!this.state.isVisible) return;
                this.hideLabel();
                break;
            default:
                console.log('action not found');
        }
    }
    toggleCompass(){
        if (this.state.isVisible) {
            this.hideCompass();
        } else {
            this.showCompass();
        }
    }
    hideCompass(){
        console.log('hide compass');
        this.toggleVisibility();
        TweenMax.to(this.circle.material.uniforms.opacity, this.animationSpeed/2, {value: 0});
    }
    showCompass(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.circle.material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    toggleLabel(){
        this.state.labelIsVisible = !this.state.labelIsVisible;
    }
    updateLabel(texture){
        this.label.material.uniforms.tex.value = texture;
    }
    showLabel(){
        this.toggleLabel();
        TweenMax.to(this.label.material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    hideLabel(){
        this.toggleLabel();
        TweenMax.to(this.label.material.uniforms.opacity, this.animationSpeed, {value: 0});
    }
    update(angle){
        this.circle.material.uniforms.angle.value = angle - PI;
    }
}

export default Compass3DC;