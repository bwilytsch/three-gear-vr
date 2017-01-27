'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';
import TextToLabel from '../../utils/textToLabel';

// Compass Shaders
const cfs = require('../../shaders/compass/compass.frag');
const cvs = require('../../shaders/compass/compass.vert');

// Label Shaders
const lfs = require('../../shaders/label/label.frag');
const lvs = require('../../shaders/label/label.vert');

// Costum shader for performance increase
// Needs angle and intersection point from raycaster

// label:
// Show crosshair label on intersection
// Remove on trigger or losing intersection
// Copy camera rotation for compass label
// Update compass label
// Animation for compass label

class Compass3D {
    constructor(){

        // Params
        this.size = 2;
        this.animationSpeed = 0.3;

        // Gaze or Controller based
        this.state = {
            isVisible: false,
            labelIsVisible: false,
        }

        // Bind methods
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.changeState = this.changeState.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.updateLabel = this.updateLabel.bind(this);
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
                vertexShader: cvs,
                fragmentShader: cfs,
                uniforms,
                transparent: true,
                side: THREE.DoubleSide,
            })
        )

        this.mesh.add(this.circle);

        this.mesh.position.y = -1.1;
        this.mesh.rotation.x = -Math.PI/2;

        Store.scene.add(this.mesh);

         // Create Label with swapable textures
         let labelUniforms = {
             tex: {
                 type: 't',
                 value: '',
             },
             opacity: {
                 type: 'f',
                 value: 0,
             }
         }
        
        this.label = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size/2, this.size/8, 1),
            new THREE.ShaderMaterial({
                vertexShader: lvs,
                fragmentShader: lfs,
                uniforms: labelUniforms,
                transparent: true,
            })
        )

        this.label.rotation.x = -Math.PI/4;
        Store.camera.add(this.label);
        this.label.position.z = -2;
        this.label.position.y = -0.8;

    }
    toggleVisibility(){
        this.state.isVisible = !this.state.isVisible;
    }
    changeState(e){
         switch(e.detail.actionType){
            case "SHOW_COMPASS":
                this.show();
                break;
            case "HIDE_COMPASS":
                this.hide();
                break;
            case "ADD_INTERSECTION":
                console.log('object found');
                this.updateLabel(e.detail.labelTexture);
                this.showLabel();
                break;
            case "REMOVE_INTERSECTION":
                console.log('object removed');
                this.hideLabel();
                break;
            default:
                console.log('action not found');
        }
    }
    hide(){
        console.log('hide compass');
        this.toggleVisibility();
        TweenMax.to(this.circle.material.uniforms.opacity, this.animationSpeed/2, {value: 0});
    }
    show(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.circle.material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    updateLabel(texture){
        this.label.material.uniforms.tex.value = texture;
    }
    showLabel(){
        TweenMax.to(this.label.material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    hideLabel(){
        TweenMax.to(this.label.material.uniforms.opacity, this.animationSpeed, {value: 0});
    }
    update(angle, point){
        
        if (point) {
            this.mesh.position.x = point.x;
            this.mesh.position.z = point.z;
        }

        this.mesh.children[0].material.uniforms.angle.value = -angle;
    }
}

export default Compass3D;