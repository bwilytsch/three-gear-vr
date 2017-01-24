'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';

const cfs = require('../../shaders/compass.frag');
const cvs = require('../../shaders/compass.vert');

// Costum shader for performance increase
// Needs angle and intersection point from raycaster

class Compass3DC {
    constructor(type){

        // Params
        this.size = 0.2;
        this.animationSpeed = 0.3;

        // Gaze or Controller based
        this.state = {
            isVisible: false,
        }

        // Bind methods
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.changeState = this.changeState.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
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
            default:
                console.log('action not found');
        }
    }
    hide(){
        console.log('hide compass');
        this.toggleVisibility();
        TweenMax.to(this.mesh.children[0].material.uniforms.opacity, this.animationSpeed/2, {value: 0});
    }
    show(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.mesh.children[0].material.uniforms.opacity, this.animationSpeed, {value: 1});
    }
    update(angle, point){
        this.mesh.children[0].material.uniforms.angle.value = -angle;
    }
}

export default Compass3DC;