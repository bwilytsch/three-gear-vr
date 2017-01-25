'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';
import TextToLabel from '../../utils/textToLabel';

const cfs = require('../../shaders/compass.frag');
const cvs = require('../../shaders/compass.vert');

// Costum shader for performance increase
// Needs angle and intersection point from raycaster
// Add label helpers for Store.targets

class Compass3DC {
    constructor(type){

        // Params
        this.size = 0.2;
        this.animationSpeed = 0.3;

        // Gaze or Controller based
        this.state = {
            isVisible: false,
        }

        this.textureGenerator = new TextToLabel();

        // Bind methods
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.changeState = this.changeState.bind(this);
        this.hideCompass = this.hideCompass.bind(this);
        this.showCompass = this.showCompass.bind(this);
        this.toggleCompass = this.toggleCompass.bind(this);
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

        let circle = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size,1),
            new THREE.ShaderMaterial({
                transparent: true,
                vertexShader: cvs,
                fragmentShader: cfs,
                uniforms,
                side: THREE.DoubleSide,
            })
        )

        this.mesh.add(circle);
        this.mesh.position.y = this.size/4;
        this.mesh.rotation.x = -Math.PI/2;


        // Create Label with swapable textures
        this.label = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size/4, 1),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                side: THREE.DoubleSide,
                map: this.textureGenerator.create('Exhibit A'),
            })
        )

        this.label.material.needsUpdate = true;

        this.label.position.z = this.size/4;
        this.label.position.y = this.size/8;
        this.label.rotation.x = Math.PI/4;
        this.mesh.add(this.label);

        // Add EventListeners

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
            case "SHOW_LABEL":
                this.showLabel();
                break;
            case "HIDE_LABEL":
                this.showLabel();
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
        TweenMax.to(this.mesh.children[0].material.uniforms.opacity, this.animationSpeed/2, {value: 0});
    }
    showCompass(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.mesh.children[0].material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    showLabel(){

    }
    hideLabel(){

    }
    update(angle, point){
        this.mesh.children[0].material.uniforms.angle.value = -angle;
    }
}

export default Compass3DC;