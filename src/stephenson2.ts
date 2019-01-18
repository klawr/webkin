
import { Solver } from './solver';
import { Mechanism } from './mech';

let phi = Math.PI*1/4;

export const stephenson2 = new Mechanism()
    .defineLink('g0', {length: 300, absAngle: 0})
    .defineLink('a0', {length: 100, absAngle: phi})
    .defineLink('a1', {length: [250,100], relAngles:[Math.PI], joint: 'a0'})
    .defineLink('b1', {length: 111.803, joint: ['a1',0]})
    .defineLink('b2', {length: 111.803, joint: ['a1',1]})
    .defineLink('c1', {length: [70.7106,100], relAngles:[Math.PI/4], joint: 'g0'});

export const fourbar = new Mechanism()
    .defineLink('a0', {length: 100, absAngle: phi})
    .defineLink('a1', {length: 200, joint: 'a0'})
    .defineLink('g0', {absAngle:0});
   // .defineLink('b1', {length:0,absAngle:0, joint: 'g0'})
   // .defineLink('b1', {length: 100, joint: 'g0'});

export const solver = new Solver([
    stephenson2.extractLoop(['b1',0],['c1',0]),
    stephenson2.extractLoop(['b2',0],['c1',1])
]);

export const fourlver = new Solver([
    fourbar.extractLoop(['a1', 0],['g0',0])
]);
