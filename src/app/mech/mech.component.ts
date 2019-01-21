import { Mechanism, Link } from "./mech.service";
import { g2 } from 'g2d';
import { SolveResult } from "./solver.service";

const background = g2()
    .clr()
    .grid({});

type Coords = { readonly x: number, readonly y: number };

export function render(mec: Mechanism, q_i: SolveResult, ctx: RenderingContext)
{
    const rcmds = g2().view({x:300,y:600,cartesian:true}).use({grp: background});
    const marked = new Map<string, Coords[]>();

    function getAngle(link: Link)
    {
        return link.absAngle === undefined ? q_i[link.id].q : link.absAngle;
    }
    function getFirstLength(link: Link)
    {
        return link.length.length ? link.length[0] : q_i[link.id].q;
    }

    function fixed(link: Link)
    {
        return link.absAngle === undefined;
    }

    function newPoint(s: Coords, len: number, angle: number) {
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
        const pts: Coords[] = [start, newPoint(start, getFirstLength(link), angle)];

        for (let i = 1; i < link.points.length; ++i)
        {
            const p = link.points[i];
            pts.push(newPoint(start, p.length, angle + p.angleOffset));
        }

        if (fixed(link))
        {
            // @ts-ignore
            rcmds.link2({pts,fs:'#66666633'});
        }
        else
        {
            // @ts-ignore
            rcmds.ply({pts,ld:g2.symbol.dashdot});
        }
        // rcmds.label({str:link.id});

        const mounts = pts.slice(1);
        marked.set(link.id, mounts);
        return mounts;
    }

    mec.links.forEach(renderLink);
    marked.forEach((m) => m.forEach(c => rcmds.nod(c)));
    rcmds.gnd({});
    rcmds.exe(ctx);
}