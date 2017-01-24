'use strict';

const PI = Math.PI;

const getRadians = (angle) => {
    return PI / 180 * angle;
}

const getDegrees = (angle) => {
    return angle / PI * 180;
}

const calcTheta = (vector) => {
    return Math.atan2(vector.x,vector.z) + PI;
}

export {
    getRadians,
    getDegrees,
    calcTheta,
}