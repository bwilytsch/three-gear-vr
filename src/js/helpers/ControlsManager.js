'use strict';

import * as THREE from 'three';
import Store from './globalStorage';

// Control Types
import CrosshairControls from './controls/CrosshairControls';
import MouseControls from './controls/MouseControls';
import TouchControls from './controls/TouchControls';
import GearVRControls from './controls/GearVRControls';
import ViveControls from './controls/ViveControls';

// GearVR
import GearVRButton from '../utils/gearVRButton';

class ControlsManager {
    // Resolve Glare/Crosshair, GearVR GamePad, Mouse, Vive Controller ( + Daydream?)
    // Always needs Raycaster and Store.targets
    constructor(){
        Store.raycaster = new THREE.Raycaster();

        this.controls = null;
        
        // Cardboard buffer
        this.touchControls = null;
        this.crosshairControls = null;

        // Bind methods
        this.getControls = this.getControls.bind(this);
        this.getCardboardControls = this.getCardboardControls.bind(this);
    }
    getControls(){
        return this.controls;
    }
    setControlsType(){

         if ( navigator.getVRDisplays ){
            navigator.getVRDisplays().then((displays) => {
                if ( displays.length > 0 ){
                    let vrDisplay = displays[0];
                    console.log(vrDisplay);
                    switch(true){
                        case displays[0].displayName.indexOf('GearVR') !== -1:
                            // Connect GamePad
                            this.controls = new GearVRControls();
                            break;
                        case displays[0].displayName.indexOf('Vive') !== -1:
                            // Connetct Vive Controllers;
                            this.controls = new ViveControls();
                            break;
                        case displays[0].displayName.indexOf('Cardboard') !== -1:
                            // Add GearVR button
                            GearVRButton.add();
                            // Connect Touch or Cursor
                            this.getCardboardControls();
                            window.addEventListener('vrdisplaydeviceparamschange', this.getCardboardControls, false)
                            break;
                        case displays[0].displayName.indexOf('Mouse') !== -1:
                            // Connect Mouse
                            this.controls = new MouseControls();
                            break;
                        default:
                            // Connect Gaze Controls
                            this.controls = new CrosshairControls();
                    }

                    // Assign update
                    this.update = this.controls.update;
                }
            }).catch((err) => {
                throw err;
            })
        } else {
            // WebVR not supported
            // Start normal experience
            // Mouse Controls
            // Is this necessary with webvr-polyfill?
        }

    }
    getCardboardControls(e){
        let deviceInfo = e ? e.detail.deviceInfo.device : Store.res;
        if (deviceInfo.width < deviceInfo.height){
            if (this.touchControls === null){
                this.touchControls = new TouchControls();
            }
            this.controls = this.touchControls;
        } else {
            if (this.crosshairControls === null){
                this.crosshairControls = new CrosshairControls();
            }
            this.controls = this.crosshairControls;
        }

        this.update = this.controls.update;
    }
    update(){
        // Will be replaced by getcControlsType
    }

}

export default ControlsManager;