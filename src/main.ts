

import { stephenson2 } from './stephenson2';

// @ts-ignore
const g = g2().clr().grid();

const cv = document.getElementById('cv') as HTMLCanvasElement;
const ctx = cv.getContext('2d');

function render() {
    g.exe(ctx);
    requestAnimationFrame(render);
};
render();

let steph = stephenson2;
