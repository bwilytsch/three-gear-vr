'use strict';

// Old
// import Compass from './VRCompass';

// new
import Store from './globalStorage';
import Compass2D from './interface/Compass2D';
import Compass3D from './interface/Compass3D';
import Compass3DC from './interface/Compass3DC';
import { calcTheta } from '../utils/math';

// VR Text/Manual

// 2D & 3D Compass

// SVG/IMG approach for 2D
// Floor mapping for gaze/crosshair 3D types
// Controller bound version

// ControlsManager hooks

class InterfaceManager {
    constructor(mode){

        // Bind methods
        this.update = this.update.bind(this);
        this.connect = this.connect.bind(this);
        
    }
    connect(mode){

        console.log(mode);

        // Interface
        switch(mode){
            case 0:
                Store.interface = new Compass2D();
                break;
            case 1:
                Store.interface = new Compass3D();
                break;
            case 2:
                Store.interface = new Compass3DC();
                break;
            default:
                // Do nothing
        }

        // Events emitted by controls
        window.addEventListener('controlsupdate', this.update, false);
        window.addEventListener('controlstriggered', Store.interface.changeState, false);
    }
    update(e){
        let vector = Store.camera.getWorldDirection();
        let theta = calcTheta(vector);
        Store.interface.update(theta,  e.detail.point);
    }
}

export default InterfaceManager;