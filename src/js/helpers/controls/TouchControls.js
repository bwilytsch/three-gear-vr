'use strict';

// Based of crosshair controls
import CrosshairControls from './CrosshairControls';
import Store from '../globalStorage';

// Add touch support for magic window mode

class TouchControls {
    constructor(){
        
        // Bind methods
        this.onTouchStart = this.onTouchStart.bind(this);
        this.update = this.update.bind(this);

        this.crosshair = new CrosshairControls();
        this.update = this.crosshair.update;

        // State managing
        this.state = {
            lastEvent: Date.now(),
        }


        // Costum Event to update Interface
        this.event = new CustomEvent('compasschange', {
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

        // Add event listeners
        Store.container.addEventListener('touchstart', this.onTouchStart, false);
    }
    onTouchStart(e){
        e.preventDefault();

         if ( Date.now() - this.state.lastEvent > 320){
            console.log('pressed');
            if (this.crosshair._INTERSECTED){
                this.crosshair.activateObject();
            }
            this.state.lastEvent = Date.now();
        }
        
    }
    update(){
        // No regular update
    }
}

export default TouchControls;