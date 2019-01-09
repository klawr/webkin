
import { stephenson2 } from './stephenson2';
import * as math from 'mathjs';

document.body.appendChild((() => {
    const cv = document.createElement('cv') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1728;
    cv.height= 972;
    return cv;
})());

const cv = document.getElementById('cv') as HTMLCanvasElement;
//const ctx = cv.getContext('2d');

// @ts-ignore
const g = g2().clr().grid();

(function render() {
    //g.exe(ctx);
    requestAnimationFrame(render);
})();

let steph = stephenson2;
console.log(steph.eqs);
console.log(steph.evacobi);
console.log(math.inv(steph.evacobi));
console.log(steph.q);
