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

// Resolve Glare/Crosshair, GearVR GamePad, Mouse, Vive Controller (+ Daydream?)

class ControlsManager {
    constructor(){
        Store.raycaster = new THREE.Raycaster();

        this.controls = null;
        this.mode = 0; // 0: 2D, 1: 3D, 2: 3DC

        // Bind methods
        this.getControls = this.getControls.bind(this);
    }
    getControls(){
        return this.controls;
    }
    getControlsMode(){
        return this.mode;
    }
    setControlsType(callback){

         if ( navigator.getVRDisplays ){
            navigator.getVRDisplays().then((displays) => {
                if ( displays.length > 0 ){
                    Store.vrDisplay = displays[0];
                    console.log(Store.vrDisplay);
                    switch(true){
                        case displays[0].displayName.indexOf('GearVR') !== -1:
                            // Connect GamePad
                            this.controls = new GearVRControls();
                            this.mode = 1;
                            break;
                        case displays[0].displayName.indexOf('Vive') !== -1:
                            // Connetct Vive Controllers;
                            this.controls = new ViveControls();
                            this.mode = 2;
                            break;
                        case displays[0].displayName.indexOf('OpenVR HMD') !== -1:
                            // Connetct hack Vive Controllers in firefox nightly;
                            this.controls = new ViveControls(2);
                            this.mode = 2;
                            break;
                        case displays[0].displayName.indexOf('Cardboard') !== -1:
                            // Add GearVR button
                            GearVRButton.add();
                            // Connect Touch or Cursor
                            this.controls = new TouchControls();
                            this.mode = 1;
                            break;
                        case displays[0].displayName.indexOf('Mouse') !== -1:
                            // Connect Mouse
                            this.controls = new MouseControls();
                            this.mode = 0;
                            break;
                        default:
                            // Connect Gaze Controls
                            this.controls = new CrosshairControls();
                            this.mode = 1;
                    }

                    // Assign update
                    this.update = this.controls.update;
                    callback(this.mode);
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
    update(){
        // Will be replaced by getcControlsType
    }

}

export default ControlsManager;