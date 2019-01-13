
import { stephenson2, solver, fourlver, fourbar } from './stephenson2';
import { render } from './render';


const g2 = require('g2d/src/g2.js');

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 1000;
    return cv;
})());
const ctx = cv.getContext('2d');

const iter = solver.solve();
(function renderLoop() {
    const rx = iter.next();
    render(stephenson2, rx.value, ctx);
    if (!rx.done)
    {
        requestAnimationFrame(renderLoop);
    }
})();
