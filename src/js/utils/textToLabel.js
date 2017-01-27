'use strict';

import Store from '../helpers/globalStorage';
import { TextureLoader } from 'three';

class TextToLabel {
    constructor(
        manager,
        params = {
            width: 512,
            height: 128,
        }
    ){

        // Needs costum loader for dynmaic content
        this.textureLoader = new TextureLoader(manager);

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
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.font= params.fontSize + "px Arial";
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(text,this.canvas.width/2,this.canvas.height/2 + params.fontSize/3);

        let dataURI = this.canvas.toDataURL('image/png', 1.0);

        return this.textureLoader.load(dataURI);
    }
}

export default TextToLabel;