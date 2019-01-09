
import { Base, Link, Mechanism } from './engine';

// control angle
let phi = Math.PI/2;
// bases and links
const base0 = new Base(0,0);
const base1 = new Base(300,0);
const a0 = new Link(100,base0,'a0', () => phi);
const a1 = new Link(250, a0, 'a1');
const a2 = new Link(100, a1,'a2', () => a1.w());
const b1 = new Link(111.803,a1, 'b1');
const b2 = new Link(111.803,a2, 'b2');
const c1 = new Link(70.7106,base1, 'c1');
const c2 = new Link(70.7106,base1,'c2',() => c1.w() - Math.PI/2);
const c3 = new Link(100,c1,'c3', () => c1.w() - Math.PI * 3 / 4);

export const stephenson2 = new Mechanism([a0,a1,a2,b1,b2,c1,c2,c3], [[b1,c2],[b2,c1]]);
