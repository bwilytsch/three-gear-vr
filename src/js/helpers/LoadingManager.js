'use strict';

import { LoadingManager } from 'three';
import { TweenMax, TimelineMax } from 'gsap';

// Based on ThreeJS DefaultLoadingManager
// Set loading screen hooks onProgress and onLoad

// Add loading interface
let introText = "The UI element behaves similar to a compass in which “North” is the initial view. A larger arc is pointing towards the current view direction of the user."

class LoadingManagerHelper {
    constructor(startCallback){
        // Setup custom loader markup
        let loaderContainer = document.createElement('div');
        loaderContainer.id = 'loader-container';
        loaderContainer.innerHTML = `
            <div class="loader-total">
                <div class="loader-progress"></div>
            </div>
            <div class="loader-intro">${introText}</div>
        `
        document.body.appendChild(loaderContainer);

        this.timeline = new TimelineMax({paused: true});
        this.timeline.to('.loader-progress', .32, { width: '100%' })
            .to('.loader-total', .32, { width: 0 }, "+= 0.32")
            .to('.loader-intro', .48, { opacity: 1, y: '-50%'}, '+= 0.32')
            .to('.loader-intro', .48, { opacity: 0, y: '-56%', onComplete: startCallback}, '+= 2')
            .to('#loader-container', 1, { opacity: 0 })
            .set('#loader-container', {display: 'none'}, "+=0.4");

        // Setup loader
        this.manager = new THREE.LoadingManager();

        this.manager.connect = (fn) => {
            TweenMax.to('.loader-total', .32, {width: 120, delay: .4, onComplete: fn});
        }

        this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
        }

        this.manager.onLoad = () => {
            this.timeline.play();
        }

        this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log( 'Loaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
            let progress = itemsLoaded/itemsTotal * 100 + '%';
            TweenMax.set('.loader-progress', {width: progress})
        }

        this.manager.onError = (url) => {
            console.log( 'There was an error loading ' + url );
        }

        return this.manager;
    }
}

export default LoadingManagerHelper;