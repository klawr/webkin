import { Component, OnInit } from '@angular/core';
import { g2 } from 'g2d';
import { Observable } from 'rxjs';
import { MechanismService } from "./mech.service";
import { SolveResult } from "./solver.service";
import { map, filter } from 'rxjs/operators';
import { MechState } from './mech.reducer';
import { Link } from './mech.model';


@Component({
    selector: 'app-mech',
    templateUrl: './mech.component.html',
    styleUrls: []
})
export class MechComponent implements OnInit
{
    renderCommands: Observable<g2>;

    constructor(
        private mechService: MechanismService
    ) {
        this.renderCommands = this.mechService.solveResult.pipe(
            filter(([_, result]) => result !== undefined),
            map(rx => this.render(...rx))
        );
    }

    ngOnInit(): void
    {
    }

    // Multi q_i
    private render(mec: MechState, q_i: SolveResult)
    {
        const rcmds = g2().view({x:650,y:400,cartesian:true});
        const marked = new Map<string, Coords[]>();

        function getAngle(link: Link)
        {
            return link.absAngle === undefined ? q_i[link.id].q : link.absAngle;
        }
        function getFirstLength(link: Link)
        {
            return link.edgeLengths.length ? link.edgeLengths[0] : q_i[link.id].q;
        }

        function fixed(link: Link)
        {
            return link.absAngle === undefined;
        }

        function newPoint(s: Coords, len: number, angle: number)
        {
            return {
                x: s.x + len * Math.cos(angle),
                y: s.y + len * Math.sin(angle)
            }
        }

        function renderLink(link: Link): Coords[]
        {
            let entry = marked.get(link.id);
            if (entry) {
                return entry;
            }

            let start: Coords = { x: 0, y: 0 };
            if (link.joint) {
                start = renderLink(mec.links[link.joint.linkId])[link.joint.mountId];
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
            // @ts-ignore
            rcmds.label({str:link.id, font:"25px", fs:"#fff"});

            const mounts = pts.slice(1);
            marked.set(link.id, mounts);
            return mounts;
        }

        Object.values(mec.links).forEach(renderLink);
        marked.forEach((m) => m.forEach(c => rcmds.nod(c)));
        rcmds.gnd({});
        return rcmds;
    }
}

type Coords = { readonly x: number, readonly y: number };
