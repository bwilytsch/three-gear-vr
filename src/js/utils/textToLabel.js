'use strict';

import Store from '../helpers/globalStorage';

class TextToLabel {
    constructor(
        params = {
            width: 512,
            height: 128,
        }
    ){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = params.width;
        this.canvas.height = params.height;

        this.create = this.create.bind(this);

        // Display canvas for debugging
        this.canvas.className = 'canvasDummy';
        // document.body.appendChild(this.canvas);

    }
    create(text, params = {
        x: 0,
        y: 0,
        fontSize: 64,
        fontWeight: 500,
        lineHeight: 80,
    }){
        this.ctx.font= params.fontSize + "px Arial";
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(text,this.canvas.width/2,this.canvas.height/2 + params.fontSize/3);

        let dataURI = this.canvas.toDataURL('image/png', 1.0);
        console.log(dataURI);

        return Store.textureLoader.load(dataURI);
    }
}

export default TextToLabel;