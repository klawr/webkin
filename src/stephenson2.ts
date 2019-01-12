
import { Mechanism } from './engine';

// control angle
let phi = Math.PI/2;
// bases and links
export const stephenson2 = new Mechanism()
    .defineLink('g0', {length: 300, absAngle: 0})
    .defineLink('a0', {length: 100, absAngle: phi})
    .defineLink('a1', {length: [250,100,350], relAngles:[0,Math.PI], joint: 'a0'})
    .defineLink('b1', {length: 111.803, joint: ['a1',1]})
    .defineLink('b2', {length: 111.803, joint: ['a1',2]})
    .defineLink('c1', {length: [70.7106,70.7106,100], relAngles:[Math.PI/2, Math.PI/4], joint: 'g0'});

/**
* "a1.angle + Math.PI / 2"
*/
