'use strict';
import * as THREE from 'three';

const getRadians = (angle) => {
    return Math.PI / 180 * angle;
}

const PI = Math.PI;

class Compass {
    constructor(camera, scene, floor){
        this.camera = camera;
        this.scene = scene;

        this.size = 2;

        this.state = {
            isShown: false,
        }

        this.draw = this.draw.bind(this);

        // Create shape
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512 * this.size;
        this.canvas.height = 512 * this.size;
        this.ctx = this.canvas.getContext('2d');
        this.texture = new THREE.Texture(this.canvas);

        this.UI = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size,1),
            new THREE.MeshBasicMaterial({
                transparent: true,
                map: this.texture,
                side: THREE.DoubleSide,
            })
        )
        this.UI.rotation.x = -PI/2;

        // Compass Parameters
        this.radius = 16;
        this.color = '#FFFFFF';
        this.lineWidth = 8;
        this.outerRadius = 0;
        this.outerRadiusMin = 0;
        this.outerRadiusMax = this.canvas.width/2 - this.lineWidth;
        this.animationSpeed = 0.3;
        this.coneStart = 0;
        this.coneEnd = PI/2;

        this.scene.add(this.UI);

        this.update(new THREE.Vector3(0,-0.8,-2));

    }
    show(){

    }
    hide(){

    }
    draw(){

        // Draw Directional Triangle
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2 - this.radius);
        this.ctx.lineTo(this.canvas.width/2 + this.radius * 1.5, this.canvas.height/2 + this.radius);
        this.ctx.lineTo(this.canvas.width/2 - this.radius * 1.5, this.canvas.height/2 + this.radius);
        this.ctx.fill();
        this.ctx.closePath();

        // Draw Outer Line
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.outerRadiusMax, 0, PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
        this.texture.needsUpdate = true;

        // Draw Directional Cone
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth * 4;
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.outerRadiusMax < this.lineWidth * 2 ? 0 : this.outerRadiusMax - this.lineWidth * 2, this.coneStart, this.coneEnd)
        this.ctx.stroke();

    }
    update(point){

        if (!point) return;
        point.y += 0.01;
        this.UI.position.copy(point);
        this.draw();

    }
}

export default Compass;