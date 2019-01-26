import { Component, OnInit } from '@angular/core';
import { g2 } from 'g2d';
import { Observable } from 'rxjs';
import { MechanismService } from "./mech.service";
import { map, filter, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { Dictionary } from './mech.reducer';
import { Link, SolveResult, SolveResults } from './mech.model';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';


@Component({
    selector: 'app-mech',
    templateUrl: './mech.component.html',
    styleUrls: []
})
export class MechComponent implements OnInit
{
    renderCommands: Observable<g2>;

    constructor(
        private store: Store<AppState>,
        private mechService: MechanismService
    ) {
        this.renderCommands = this.store.select(s => s.mech.solveResults).pipe(
            distinctUntilChanged(),
            filter(r => r && r.length > 0),
            withLatestFrom(this.store.select(s => s.mech.links).pipe(distinctUntilChanged())),
            map(([results, links]) => this.renderCombine(links, results))
        );
    }

    ngOnInit(): void
    {
    }

    // Multi q_i
    private renderCombine(links: Dictionary<Link>, q_i: SolveResults)
    {
        const rcmds = g2().view({x:650,y:400,cartesian:true});

        [...q_i].reverse().forEach(v => this.render(links, v, rcmds, '#fff')) // TODO: colors

        rcmds.gnd({});
        return rcmds;
    }

    private render(links: Dictionary<Link>, q_i: SolveResult, rcmds: g2, color: string)
    {
        const marked = new Map<string, RenderInfo[]>();

        function getAngle(link: Link)
        {
            return link.absAngle === undefined ? q_i[link.id].q : link.absAngle;
        }
        function getFirstLength(link: Link)
        {
            return link.edgeLengths.length ? link.edgeLengths[0] : -q_i[link.id].q;
        }

        function fixed(link: Link)
        {
            return link.absAngle !== undefined;
        }

        function newPoint(s: Vector2, len: number, angle: number)
        {
            return {
                x: s.x + len * Math.cos(angle),
                y: s.y + len * Math.sin(angle)
            }
        }
        function newSpeed(v: Vector2, len: number, angle: number, link: Link)
        {
            const sol = q_i[link.id];
            return sol ? {
                x: v.x - sol.v * len * Math.sin(angle),
                y: v.y + sol.v * len * Math.cos(angle)
            } : { x: 0, y: 0 };
        }
        function newAccel(a: Vector2, len: number, angle: number, link: Link)
        {
            const sol = q_i[link.id];
            return sol ? {
                x: a.x - sol.a * len * Math.sin(angle) - sol.v * sol.v * len * Math.cos(angle),
                y: a.y + sol.a * len * Math.cos(angle) - sol.v * sol.v * len * Math.sin(angle)
            } : { x: 0, y: 0 };
        }

        function renderLink(link: Link): RenderInfo[]
        {
            let entry = marked.get(link.id);
            if (entry) {
                return entry;
            }

            let start: RenderInfo = {
                coordinates: { x: 0, y: 0 },
                velocity: { x:0, y: 0 },
                acceleration: { x:0, y:0 }
            };
            if (link.joint) {
                start = renderLink(links[link.joint.linkId])[link.joint.mountId];
            }

            const angle = getAngle(link);
            const len = getFirstLength(link)
            const info: RenderInfo[] = [start, {
                coordinates: newPoint(start.coordinates, len, angle),
                velocity: newSpeed(start.velocity, len, angle, link),
                acceleration: newAccel(start.acceleration, len, angle, link)
            }];

            for (let i = 1; i < link.points.length; ++i)
            {
                const p = link.points[i];
                info.push({
                    coordinates: newPoint(start.coordinates, p.length, angle + p.angleOffset),
                    velocity: newSpeed(start.velocity, p.length, angle + p.angleOffset, link),
                    acceleration: newAccel(start.acceleration, p.length, angle + p.angleOffset, link)
                });
            }
            const pts = info.map(p => p.coordinates);
            if (!fixed(link))
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
           // rcmds.label({str:link.id, font:"25px", fs:"#fff"});

            const mounts = info.slice(1);
            marked.set(link.id, mounts);
            return mounts;
        }
        Object.values(links).forEach(renderLink);
        function getVec(a: Vector2, b: Vector2)
        {
            return {
                x1: a.x,
                y1: a.y,
                x2: a.x + b.x,
                y2: a.y + b.y
            };
        }
        marked.forEach((m) => m.forEach(info =>
            rcmds.nod(info.coordinates)
                //.vec(getVec(info.coordinates, info.velocity)).label({str:`${Math.round(info.velocity.x)}, ${Math.round(info.velocity.y)}`})
        ));
    }
}

type Vector2 = { readonly x: number, readonly y: number };

type RenderInfo = {
    coordinates: Vector2,
    velocity: Vector2,
    acceleration: Vector2
}
