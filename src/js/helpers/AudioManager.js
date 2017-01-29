'use strict';

import Store from './globalStorage';
import { AudioListener, AudioLoader, PositionalAudio } from 'three';

class AudioManager {

    constructor(){

        // Bind mehtods
        this.create = this.create.bind(this);

        this.listener = new AudioListener();
        Store.camera.add(this.listener);

        this.audioLoader = new AudioLoader(Store.loadingManager);

    }

    create(mesh, songURL){
        let positionalAudio = new PositionalAudio(this.listener);
        this.audioLoader.load(songURL, (buffer) => {
            positionalAudio.setBuffer(buffer);
            positionalAudio.setRefDistance(20);
            positionalAudio.setLoop(true);

            mesh.audioIsPlaying = false;

            mesh.toggle = () => {
                if (mesh.audioIsPlaying){
                    positionalAudio.pause();
                } else {
                    positionalAudio.play();
                }
                mesh.audioIsPlaying = !mesh.audioIsPlaying;
            }

            mesh.add(positionalAudio);
        })
    }

}

export default AudioManager;