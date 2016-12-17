'use strict';
const iconURL = 'assets/oculus.svg';


require('es6-promise-polyfill');

let vrDisplay;

class GearVR {
    constructor(source, path){

        this.source = source
        path = path || '';

        // Create Oculus Icon
        let icon = document.createElement('a');
        icon.href = "ovrweb:" + window.location.href.toString() + path;
        icon.style.position = "fixed";
        icon.style.width = "24px";
        icon.style.height = "24px";
        icon.style.bottom = '24px';
        icon.style.right = '24px';
        icon.style.display = "block";
        icon.style.cursor = "pointer";

        this.update = null;
        this.render = null;

        let iconIMG = new Image();
        iconIMG.onload = () => {
            icon.appendChild(iconIMG);
            document.body.appendChild(icon);
        }
        iconIMG.crossOrigin = '';
        iconIMG.src = iconURL;

        this.animate = this.animate.bind(this);
        this.connect = this.connect.bind(this);
        this.start = this.start.bind(this);
        this.animateVR = this.animateVR.bind(this);

    }
    connect(render, update){
        this.update = update;
        this.render = render;
        if ( navigator.getVRDisplays ){
            navigator.getVRDisplays().then((displays) => {
                if ( displays.length > 0 ){
                    vrDisplay = displays[0];
                    this.start();
                }
            }).catch((err) => {
                throw err;
            })
        } else {
            // WebVR not supported
            // Start normal experience
            requestAnimationFrame(this.animate);
        }
    }
    start(){
        if ( vrDisplay === undefined ) return;
        vrDisplay.requestPresent([{source: this.source.domElement}]).then(() => {
            vrDisplay.requestAnimationFrame(this.animateVR);
        });
    }
    animate(){
        this.update();
        this.render();
        requestAnimationFrame(this.animate);
    }
    animateVR(){
        this.update();
        this.render();
        vrDisplay.requestAnimationFrame(this.animateVR);
    }
}

export default GearVR;