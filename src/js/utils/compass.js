'use strict';
import * as THREE from 'three';
import { TweenMax, TimelineMax } from 'gsap';

const getRadians = (angle) => {
    return Math.PI / 180 * angle;
}

const PI = Math.PI;

// Rewrite getting the text parent container of the compass

class Compass {
    constructor(camera, scene, floor){
        this.camera = camera;
        this.scene = scene;
        this.deviceType = null;

        this.size = 2;

        this.state = {
            isVisible: false,
        }

        this.draw = this.draw.bind(this);
        this.updateConeAngle = this.updateConeAngle.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.showCSSLabel = this.showCSSLabel.bind(this);
        this.hideCSSLabel = this.hideCSSLabel.bind(this);
        this.getCSSContainer = this.getCSSContainer.bind(this);

        this.getCSSContainer();

        // Create shape
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512 * this.size;
        this.canvas.height = 512 * this.size;
        this.canvas.className = 'compass';
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
        this.UI.position.y = 0.01;
        this.UI.material.opacity = 0;

        // Compass Parameters
        this.radius = 24;
        this.color = '#FFFFFF';
        this.lineWidth = 8;
        this.outerRadius = 0;
        this.outerRadiusMin = 0;
        this.outerRadiusMax = this.canvas.width/2 - this.lineWidth;
        this.animationSpeed = 0.3;
        this.coneStart = 0;
        this.coneEnd = PI/2;

        this.scene.add(this.UI);

        this.update(new THREE.Vector3(0,-1.6,-2));

    }
    getCSSContainer(){
        if ( this.textContainer === null || this.textContainer === undefined ) {
                    console.log(this.textContainer);
            this.textContainer = document.getElementById('compass-text');
        }
    }
    showCSSLabel(text){
        console.log('expand CSS label');
        this.getCSSContainer();
        this.textContainer.innerHTML = text;
        TweenMax.to('#compass-container', 0.3, {width: this.textContainer.clientWidth + 32, onComplete: () => {
            TweenMax.to('#compass-text', 0.3, {opacity: 1, delay: 0.2});
        }});
    }
    hideCSSLabel(){
        console.log('collapse CSS label');
        this.getCSSContainer();
        this.textContainer.innerHTML = '';
        TweenMax.to('#compass-container', 0.16, { width: 36});
        TweenMax.to('#compass-text', 0.16, {opacity: 0});
    }
    toggleVisibility(){
        this.state.isVisible = !this.state.isVisible;
        console.log(this.state.isVisible);
    }
    show(){
        console.log('show compass');
        this.toggleVisibility();
        TweenMax.to(this.UI.material, this.animationSpeed, {opacity: 1});
    }
    hide(){
        console.log('hide compass');
        this.toggleVisibility();
        TweenMax.to(this.UI.material, this.animationSpeed/2, {opacity: 0});
    }
    updateConeAngle(angle){
        this.coneStart = angle - PI * 2/3;
        this.coneEnd = this.coneStart + PI / 2;
    }
    draw(angle){
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        // Draw Directional Triangle
        this.ctx.save()
        this.ctx.beginPath();
        this.ctx.fillStyle = this.color;
        // this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
        // this.ctx.rotate(angle);
        // this.ctx.translate(-this.canvas.width/2, -this.canvas.height/2);
        this.ctx.moveTo(this.canvas.width/2, this.canvas.height/2 - this.radius);
        this.ctx.lineTo(this.canvas.width/2 + this.radius * 1.5, this.canvas.height/2 + this.radius);
        this.ctx.lineTo(this.canvas.width/2 - this.radius * 1.5, this.canvas.height/2 + this.radius);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();

        // Draw Outer Line
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.outerRadiusMax, 0, PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();

        // Draw Directional Cone
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth * 4;
        this.ctx.arc(this.canvas.width/2, this.canvas.height/2, this.outerRadiusMax < this.lineWidth * 2 ? 0 : this.outerRadiusMax - this.lineWidth * 2, this.coneStart, this.coneEnd)
        this.ctx.stroke();

        this.texture.needsUpdate = true;

    }
    update(angle, point){

        if (point) {
            this.UI.position.x = point.x;
            this.UI.position.z = point.z;
        }

        // Rework this section
        // Increate performance
        // this.updateConeAngle(-angle);
        // this.draw(angle);

    }
}

export default Compass;