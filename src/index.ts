
import { fourbar } from './stephenson2';
import {  Link, Loop, Mechanism } from './engine';


const g2 = require('g2d/src/g2.js');

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 500;
    return cv;
})());
const ctx = cv.getContext('2d');

const steph = fourbar;

// g should be g2
function draw(mec: Mechanism,g: any) {
}

(function render() {
    g2().clr()
        .view({cartesian:true, x: 50, y:300})
        .grid()
        .ins((k: any) => {draw(steph, k)}).exe(ctx);
    requestAnimationFrame(render);
})();

