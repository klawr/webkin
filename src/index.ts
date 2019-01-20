
import { stephenson2, solver, fourbar, fourbarsolver, solver2, stephenson22, accsolver, acc } from './stephenson2';
import { render } from './render';

const cv = document.body.appendChild((() => {
    const cv = document.createElement('canvas') as HTMLCanvasElement;
    cv.id = 'cv';
    cv.width= 1000;
    cv.height= 1000;
    return cv;
})());
const ctx = cv.getContext('2d');

let phi = Math.PI*1/4;

if (false)
{
    const val = exhaust(fourbarsolver(['a0', phi]), 42);
    render(fourbar, val, ctx);
}
else
{
    let rx;
    // const iter = solver.solve();
    (function renderLoop()
    {
        rx = exhaust(accsolver(['f0', phi], rx), 42);
        if (rx)
        {
            render(acc, rx, ctx);
        }
       // phi -= Math.PI / 180;
        requestAnimationFrame(renderLoop);
    })();
}

function exhaust<T>(it: IterableIterator<T>, max: number)
{
    let val;
    for (let i = 0; i < max; ++i)
    {
        const rx = it.next();
        if (!rx.done)
        {
            val = rx.value;
        }
        else
        {
            return val;
        }
    }
    return undefined;
}


