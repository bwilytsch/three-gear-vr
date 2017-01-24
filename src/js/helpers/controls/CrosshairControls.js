'use strict';

import * as THREE from 'three';
import * as PIXI from 'pixi.js';
import { TweenMax } from 'gsap';
import Store from '../globalStorage';

// Add crosshair via PixiJS Graphics texture
// Show loader on intersection
// Trigger after x time
// Raycast position via camera
// Expose trigger method for GearVR

const PI = Math.PI;

class CrosshairControls {
    constructor(){
        // Init crosshair
        this.state = {
            hasIntersection: false,
            isTriggered: false,
            radius: 256,
            progress: 0,
            startAngle: 0,
            endAngle: PI/2,
            loaderRadius: 0.10,
        }

        this._INTERSECTED = undefined;
        this.point = null;

        this.textureRenderer = new PIXI.WebGLRenderer(512,512, {
            transparent: true,
        }); 
        this.stage = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.texture = new THREE.Texture(this.textureRenderer.view);

        this.stage.addChild(this.graphics);

        // Bind methods
        this.draw = this.draw.bind(this);
        this.activateObject = this.activateObject.bind(this);
        this.showLoader = this.showLoader.bind(this);
        this.hideLoader = this.hideLoader.bind(this);
        this.drawPercentage = this.drawPercentage.bind(this);
        this.update = this.update.bind(this);

        this.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 0.16, 0.16 ),
            new THREE.MeshBasicMaterial({
                map: this.texture,
                transparent: true,
                side: THREE.DoubleSide,
            })
        )

        this.mesh.position.z = -2;
        Store.camera.add(this.mesh);
        this.draw();

        this.progressAnimation = new TimelineMax({pause: true, onUpdate: this.drawPercentage, onComplete: this.activateObject});
        this.progressAnimation.fromTo(this.state, 1, {progress: 0}, {progress: 1} );

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
    draw(){

        this.graphics.clear();

        if ( this.state.hasIntersection ){

            // Draw loader Base
            this.graphics.lineStyle(this.state.radius * 0.24, 0xFFFFFF, 0.5);
            this.graphics.arc(this.state.radius,this.state.radius,this.state.radius * this.state.loaderRadius, 0, PI * 2 + 0.01);
            this.graphics.closePath();

        }

        // Draw Base Cursor
        this.graphics.beginFill(0xFF0000,1);
        this.graphics.lineStyle(0, 0xFFFFFF, 0);
        this.graphics.drawCircle(this.state.radius, this.state.radius, this.state.radius * 0.24);
        this.graphics.endFill();

        this.texture.needsUpdate = true;

    }
    drawPercentage(){
        this.draw();
        
        this.graphics.lineStyle(this.state.radius * 0.24, 0xFFFFFF, 1);
        this.graphics.arc(this.state.radius,this.state.radius,this.state.radius * this.state.loaderRadius, -PI/2, PI * 2  * this.state.progress - PI/2);
        
    }
    showLoader(){
        console.log('show loader');
        this.state.hasIntersection = true;
        this.state.isTriggered = false;
        TweenMax.to(this.state, 0.3, { loaderRadius: 0.48, onUpdate: this.draw, onComplete: () => {
            this.progressAnimation.restart();
        } } );
    }
    hideLoader(){
        console.log('hide loader');
        this.state.isTriggered = true;
        this.progressAnimation.pause();
        TweenMax.to(this.state, 0.16, { loaderRadius: 0.08, onComplete: () => {
            this.state.hasIntersection = false;
            this.state.isTriggered = false;
            this.draw();
        }, onUpdate: this.draw } )
    }
    activateObject(){
        if ( this._INTERSECTED ){
            if ( typeof this._INTERSECTED.trigger === 'function' ){
                this._INTERSECTED.trigger();
            }
            this.hideLoader();
        }
    }
    update(){
        this.textureRenderer.render(this.stage);

        Store.raycaster.setFromCamera({x: 0, y: 0}, Store.camera);
        let intersects = Store.raycaster.intersectObjects(Store.targets.children);

        if ( intersects.length > 0 ) {

            if ( this._INTERSECTED != intersects[ 0 ].object ) {
                if ( this._INTERSECTED );
                    this._INTERSECTED = intersects[ 0 ].object;
                if ( intersects[0].object.name !== "floor" ){
                    this.showLoader();
                } else {
                    this.hideLoader();
                }
            }

            if ( intersects[ 0 ].object.name === "floor"){
                
                this.point = intersects[ 0 ].point;
                this.controlsUpdateEvent.detail.point = this.point;
                window.dispatchEvent(this.controlsUpdateEvent);

                if ( this.point.distanceTo(Store.camera.position) < 4.2){
                    if (!Store.interface.state.isVisible){
                        this.controlsTriggeredEvent.detail.actionType = "SHOW_COMPASS";
                        window.dispatchEvent(this.controlsTriggeredEvent);
                    };
                } else {
                     if (Store.interface.state.isVisible){
                        this.controlsTriggeredEvent.detail.actionType = "HIDE_COMPASS";
                        window.dispatchEvent(this.controlsTriggeredEvent);
                    };
                }
            }

        } else {

            if ( this._INTERSECTED ){

                if ( typeof this._INTERSECTED.reset === 'function') {
                    this._INTERSECTED.reset();
                }

                this.hideLoader();
                this._INTERSECTED = undefined;
            }

        }

    }

}

export default CrosshairControls;