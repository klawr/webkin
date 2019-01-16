
import { stephenson2, solver } from './stephenson2';
import { render } from './render';
import { Matrix } from './engine';
import { RSA_X931_PADDING } from 'constants';


const g2 = require('g2d/src/g2.js');

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 1000;
    return cv;
})());
const ctx = cv.getContext('2d');

let last;
for (const v of solver.solve())
{
    last = v;
}
render(stephenson2, last, ctx);

(function renderLoop() {
//    const rx = iter.next();
    //render(stephenson2, rx.value, ctx);
    // if (!rx.done)
    // {
    //     requestAnimationFrame(renderLoop);
    // }
    // else
    // {
    //     console.log("FINISHED!!! HAHAHAH");
    // }
})();
