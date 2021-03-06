'use strict';

import { TweenMax } from 'gsap';
import { getDegrees } from '../../utils/math';

// CSS & SVG based approach
// Needs camara rotation
// Will require object passed from raycaster for name label
// Hijack on :hover? MouseControls

class Compass2D {
    constructor(){

        // Bind methods
        this.changeState = this.changeState.bind(this);
        this.showLabel = this.showLabel.bind(this);
        this.hideLabel = this.hideLabel.bind(this);
        this.getCSSContainer = this.getCSSContainer.bind(this);

        this.state = {
            isVisible: false,
        }

        // ES6 string literals
        let container = document.createElement('div');
        container.id = 'compass-container';
        container.innerHTML  = `
            <div id="compass-text">Hello World</div>
            <div id="compass">
                <div id="compass-direction"></div>
                <div id="compass-arrow"></div>
            </div>
        `
        document.body.appendChild(container);

        this.getCSSContainer();
    }
    getCSSContainer(){
        if ( this.textContainer === null || this.textContainer === undefined ) {
            this.textContainer = document.getElementById('compass-text');
        }
    }
    changeState(e){
        switch(e.detail.actionType){
            case "REMOVE_INTERSECTION":
                this.hideLabel();
                break;
            case "ADD_INTERSECTION":
                this.showLabel(e.detail.objectName);
                break;
            default:
                console.log('default triggered');
        }
    }
    showLabel(text){
        this.textContainer.innerHTML = text;
        TweenMax.to("#compass-text", 0.32, {x: 0, opacity: 1});
    }
    hideLabel(){
        TweenMax.to("#compass-text", 0.16, {x: 8, opacity: 0});
    }
    toggleVisibility(){
        this.state.isVisible = !this.state.isVisible;
    }
    update(angle){
        TweenMax.set('#compass-direction', { rotationZ: -getDegrees(angle)});
    }
}

export default Compass2D;