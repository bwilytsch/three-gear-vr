'use strict';

// Based of crosshair controls
import CrosshairControls from './CrosshairControls';

// Add red dot crosshair
// trigger Item on GearPad input (+ after time?)
// Raycast position via camera
// Reuse Crosshair class and add gamepad trigger

class GearVRControls {
    constructor(){
        this._INTERSECTED

        // Bind methods
        this.update = this.update.bind(this);
        this.connectGamepad = this.connectGamepad.bind(this);
        this.updateGamepad = this.updateGamepad.bind(this);

        this.crosshair = new CrosshairControls();
        this.updateCrosshair = this.crosshair.update;

        // Connect gamepad
        this.state = {
            lastButtons: [],
            lastAxes: [],
            lastEvent: Date.now(),
            isConnected: false,
        }

        window.addEventListener('gamepadconnected', this.connectGamepad);
        
    }
    connectGamepad(){
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        console.log(gamepads);
        for ( let i = 0; i < gamepads.length; i++ ){
            if ( gamepads[i] === undefined || gamepads[i] === null ) return;
            let activePad = gamepads[i];
            if ( activePad.id.includes("Gear VR") ){
                this.gamePad = i;
                this.state.isConnected = true;
                console.log( "Gear VR GamePad connected and active" );
            }
        }
    }
    updateGamepad(){
        if (!this.state.isConnected) return;
        let activePad = navigator.getGamepads()[this.gamePad];
        if ( activePad.buttons[0].pressed &&  Date.now() - this.state.lastEvent > 320){
            console.log('pressed');
            if (this.crosshair._INTERSECTED){
                this.crosshair.activateObject();
            }
            this.state.lastEvent = Date.now();
        }
    }
    update(){
        this.updateGamepad();
        this.updateCrosshair();
    }
}

export default GearVRControls;