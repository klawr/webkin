
import { stephenson2, solver } from './stephenson2';
import * as math from 'mathjs';
import { Link } from './engine';


const g2 = require('g2d/src/g2.js');

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 500;
    return cv;
})());
const ctx = cv.getContext('2d');

const steph = stephenson2;
console.log(steph.loops);
const g = g2()
    .clr()
    .view({cartesian:true, x: 50, y:300})
    .grid()
    .ins((k: any) => {
        steph.loops.forEach((loop: Link[][]) => {
            loop.forEach((link,idx) => {
                let acc_x = 0;
                let acc_y = 0;
                link.forEach((l) => {
                    const x = l.r * Math.cos(l.w());
                    const y = l.r * Math.sin(l.w());
                    k.lin({x1:acc_x,y1:acc_y,x2:acc_x + x,y2:acc_y + y})
                     .cir({x: acc_x + x,y: acc_y + y,r:1})
                     .txt({x: acc_x + x,y: acc_y + y,str:l.name});
                    acc_x += x;
                    acc_y += y;
                });
            });
        });
    });

(function render() {
    g.exe(ctx);
    requestAnimationFrame(render);
})();

console.log(solver.q);
// // console.log(steph);
// // console.log(steph.vars);
// console.log(steph.eqs);
// console.log(math.inv(steph.jacobi));
// console.log(steph.q);
