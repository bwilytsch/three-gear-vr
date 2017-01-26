'use strict';

import { LoadingManager } from 'three';

// Based on ThreeJS DefaultLoadingManager
// Set loading screen hooks onProgress and onLoad

class LoadingManagerHelper {
    constructor(){
        this.manager = new THREE.LoadingManager();

        this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        }

        this.manager.onLoad = () => {
            console.log('Loading complete');
        }

        this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        }

        this.manager.onError = (url) => {
            console.log( 'There was an error loading ' + url );
        }

        return this.manager;
    }
    connect(){

    }
}

export default LoadingManagerHelper;