'use strict';

import * as THREE from 'three';
import Store from '../globalStorage';

// Ad red dot for cursor
// Increase dotsize on :hover
// RaycastPosition via Mouse Vector
// Trigger click/mousedown event

class MouseControls {
    constructor(){
        this._INTERSECTED = undefined;
        this.mousePos = new THREE.Vector2(Store.res.width, Store.res.height);

        // Bind this scope to methods
        this.update = this.update.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);

        // Add event listeners
        Store.container.addEventListener('mousedown', this.onMouseDown, false);
        window.addEventListener('mousemove', this.onMouseMove, false);

    }
    onMouseDown(e){
        e.preventDefault();
        if ( this._INTERSECTED ){
            console.log('mousedown!');
            if ( typeof this._INTERSECTED.trigger === 'function' ){
                this._INTERSECTED.trigger();
            }
        }
    }
    onMouseMove(e){
        this.mousePos.x = (e.clientX / Store.res.width) * 2 - 1;
        this.mousePos.y = -(e.clientY / Store.res.height) * 2 + 1;
    }
    update(){
        Store.raycaster.setFromCamera( this.mousePos, Store.camera);
        let intersects = Store.raycaster.intersectObjects(Store.targets.children);

         if ( intersects.length > 0 ) {

            document.body.style.cursor = "pointer";

            if ( this._INTERSECTED != intersects[ 0 ].object ) {
                if ( this._INTERSECTED );
                this._INTERSECTED = intersects[ 0 ].object;
            }

        } else {

            if ( this._INTERSECTED ){



                document.body.style.cursor = "default";
                this._INTERSECTED = undefined;
            }

        }
    }
}

export default MouseControls;