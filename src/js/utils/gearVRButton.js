'use strict';

// Make svg inline or swap with hires image

let GearVRButton = {
    add: function(params = {
        path: '',
    }){
        console.log(params, "created");
        let icon = document.createElement('a');
        icon.href = "ovrweb:" + window.location.href.toString() + params.path;
        icon.style.position = "fixed";
        icon.style.width = "24px";
        icon.style.height = "24px";
        icon.style.bottom = '12px';
        icon.style.left = '16px';
        icon.style.display = "block";
        icon.style.cursor = "pointer";
        icon.style.zIndex = 4;

        let svg = require('../../assets/oculus.svg');

        let iconIMG = new Image();
        iconIMG.onload = () => {
            icon.appendChild(iconIMG);
            document.body.appendChild(icon);
        }
        iconIMG.crossOrigin = '';
        iconIMG.src = svg;

        document.body.appendChild(icon);
    }
}

export default GearVRButton;