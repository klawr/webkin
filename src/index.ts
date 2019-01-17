
import { stephenson2, solver, fourbar, fourlver } from './stephenson2';
import { render } from './render';

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 1000;
    return cv;
})());
const ctx = cv.getContext('2d');


if (true)
{
    let last;
//    for (const v of solver.solve())
    for (const v of fourlver.solve())
    {
        last = v;
    }
    render(fourbar, last, ctx);
//    render(stephenson2, last, ctx);
}
else
{
    const iter = solver.solve();
    (function renderLoop() {
        const rx = iter.next();
        render(stephenson2, rx.value, ctx);
        if (!rx.done)
        {
            requestAnimationFrame(renderLoop);
        }
        else
        {
            console.log("FINISHED!!! HAHAHAH");
        }
    })();
}


