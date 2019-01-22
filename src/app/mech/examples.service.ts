
// import { xySolver } from './solver.service';
// import { Mechanism, MechanismData } from './mech.service';

// export const stephenson2 = (self: Mechanism) => self
//     .defineLink('g0', {length: 300, absAngle: 0})
//     .defineLink('a0', {length: 100})
//     .defineLink('a1', {length: [250,100], relAngles:[Math.PI], joint: 'a0'})
//     .defineLink('b1', {length: 111.803, joint: ['a1',0]})
//     .defineLink('b2', {length: 111.803, joint: ['a1',1]})
//     .defineLink('c1', {length: [70.7106,100], relAngles:[Math.PI/4], joint: 'g0'});

// export const stephenson22 = (self: Mechanism) => self
//     .defineLink('g01', {absAngle: 0})
//     .defineLink('a01', {length: [50,100],relAngles:[-Math.PI/6]})
//     .defineLink('a02', {length: 150, joint:"a01"})
//     .defineLink('a03', {length: 100, joint:["a01",1]})
//     .defineLink('b01', {length: 80, absAngle:Math.PI/2, joint:"g01"})
//     .defineLink('b02', {length: [80,50], relAngles:[-Math.PI*2/3],joint:"b01"});

// export const fourbar = (self: Mechanism) => self
//     .defineLink('a0', {length: 100})
//     .defineLink('a1', {length: 200, joint: 'a0'})
//     //.defineLink('g0', {absAngle:0})
//     //.defineLink('g1', { absAngle:0, joint: 'g0', length: 250 });
//     .defineLink('g0', {length:200,absAngle:0})
//     .defineLink('b1', {length: 100, joint: 'g0'});

// export const acc = (self: Mechanism) => self
//     .defineLink('f0',{length: Math.SQRT2 * 100})
//     .defineLink('f1',{length: 200, joint: 'f0'})
//     .defineLink('h1',{length: 300, joint: 'h0'})
//     .defineLink('h0',{length: 500, absAngle: Math.atan2(3,4)});

// export const accsolver = (self: MechanismData) => xySolver([
//     self.extractLoop(['f1',0],['h1',0])
// ]);

// export const solver = (self: MechanismData) => xySolver([
//     self.extractLoop(['b1',0],['c1',0]),
//     self.extractLoop(['b2',0],['c1',1])
// ]);

// export const fourbarsolver = (self: MechanismData) => xySolver([
//     self.extractLoop(['a1', 0],['b1',0])
// ]);

// export const solver2 = (self: MechanismData) => xySolver([
//     self.extractLoop(['b02',0],['a03',0]),
//     self.extractLoop(['b02',1],['a02',0])
// ])
