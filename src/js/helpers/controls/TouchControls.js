'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';

// Add touch support for magic window mode

class TouchControls {
    constructor(){
        this._INTERSECTED = undefined;
        this.touchPos = new THREE.Vector2(Store.res.width, Store.res.height);
        this.touchEvent = null;
        
        // Bind methods
        this.onTouchStart = this.onTouchStart.bind(this);
        this.update = this.update.bind(this);

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

        this.touchEvent = e.touches[0] || e.changedTouches[0];

        this.touchPos.x = (this.touchEvent.clientX / Store.res.width) * 2 - 1;
        this.touchPos.y = -(this.touchEvent.clientY / Store.res.height) * 2 + 1;

        Store.raycaster.setFromCamera( this.touchPos, Store.camera);
        let intersects = Store.raycaster.intersectObjects(Store.targets.children);

         if ( intersects.length > 0 ) {

            if ( this._INTERSECTED != intersects[ 0 ].object ) {
                if ( this._INTERSECTED );
                this._INTERSECTED = intersects[ 0 ].object;

                this.controlsTriggeredEvent.detail.actionType = "ADD_INTERSECTION";
                this.controlsTriggeredEvent.detail.objectName = this._INTERSECTED.name;
                window.dispatchEvent(this.controlsTriggeredEvent);

                if ( typeof this._INTERSECTED.trigger === 'function') {
                    this._INTERSECTED.trigger();
                }
            }

        } else {

            if ( this._INTERSECTED ){

                if ( typeof this._INTERSECTED.reset === 'function') {
                    this._INTERSECTED.reset();
                }

                this.controlsTriggeredEvent.detail.actionType = "REMOVE_INTERSECTION";
                window.dispatchEvent(this.controlsTriggeredEvent);

                this._INTERSECTED = undefined;
            }

        }
    }
    update(){
        // No regular update

        // Dispatch custom event
        // Hook for interface manipulation
        window.dispatchEvent(this.event);
    }
}

export default TouchControls;