import { Mechanism, Link } from "./engine";
const g2 = require('g2d/src/g2.js');

const background = g2()
    .clr()
    .grid();

type Coords = { readonly x: number, readonly y: number };

export function render(mec: Mechanism, q_i: Map<string, number>, ctx: CanvasRenderingContext2D) {
    const rcmds = g2().view({x:300,y:600,cartesian:true}).use({grp: background});
    const marked = new Map<string, Coords[]>();

    function getAngle(link: Link) {
        return link.absAngle === undefined ? q_i.get(link.id) : link.absAngle;
    }
    function getFirstLength(link: Link) {
        return link.length.length ? link.length[0] : q_i.get(link.id);
    }

    function np(s: Coords, len: number, angle: number) {
        return {
            x: s.x + len * Math.cos(angle),
            y: s.y + len * Math.sin(angle)
        }
    }

    function renderLink(link: Link): Coords[] {
        let entry = marked.get(link.id);
        if (entry) {
            return entry;
        }

        let start: Coords = { x: 0, y: 0 };
        if (link.joint) {
           start = renderLink(mec.links.get(link.joint[0]))[link.joint[1]];
        }

        const angle = getAngle(link);
        const pts: Coords[] = [start, np(start, getFirstLength(link), angle)];

        for (let i = 1; i < link.points.length; ++i)
        {
            const p = link.points[i];
            pts.push(np(start, p.length, angle + p.angleOffset));
        }

        rcmds.ply({pts, closed: true}).txt({...pts[0], str:link.id})
        const mounts = pts.slice(1);
        marked.set(link.id, mounts);
        return mounts;
    }

    mec.links.forEach(renderLink);
    rcmds.exe(ctx);
}
