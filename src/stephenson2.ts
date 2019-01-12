
import { Link, Mechanism, Solver, Value } from './engine';

// control angle
let phi = Math.PI/2;
// bases and links
export const stephenson2 = new Mechanism()
    .defineLink('g0', {length: 300, angle: 0})
    .defineLink('a0', {length: 100, angle: phi})
    .defineLink('a1', {length: 250, parentId: 'a0'})
    .defineLink('a2', {length: 100, angle: new Value((a1) => a1.angle.val(), ['a1']), parentId: 'a1'})
    .defineLink('b1', {length: 111.803, parentId: 'a1'})
    .defineLink('b2', {length: 111.803, parentId: 'a2'})
    .defineLink('c1', {length: 70.7106, parentId: 'g0'})
    .defineLink('c2', {length: 70.7106, angle: new Value((c1) => c1.angle.val() + Math.PI / 2, ['c1']), parentId: 'g0'})
    .defineLink('c3', {length: 100, angle: new Value((c1) => c1.angle.val() - Math.PI * 3 / 4), parentId: 'c1'});
