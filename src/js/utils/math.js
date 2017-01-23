'use strict';

const PI = Math.PI;

const getRadians = (angle) => {
    return PI / 180 * angle;
}

const getDegrees = (angle) => {
    return angle / PI * 180;
}

export {
    getRadians,
    getDegrees,
}