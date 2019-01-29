import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { AppState } from '../app.state';
import * as dict from '../utils/dictionary';
import { SolveResultsUpdateAction } from './mech.actions';
import { Link, LinkInfo, Loop, MechPointInfo, SolveResult, SolveResults, Variable, Vector2 } from './mech.model';
import { Dictionary } from './mech.reducer';
import { MetaSolveFunc, solver } from './solver.service';



export const selectPhi = (state: AppState) => state.mech.phi;
export const selectMech = (state: AppState) => state.mech;
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

@Injectable({providedIn: 'root'})
export class MechanismService
{
    constructor(private readonly store: Store<AppState>)
    {
        this.store.select(selectMech).pipe(
            filter(m => !!m.loopCache && m.loopCache.length > 0),
            distinctUntilChanged((old, next) => old.loopCache === next.loopCache && old.phi === next.phi)
        ).subscribe(m => {
            let t = -performance.now();

            const results = [...this.solveFor(m.loopCache, solver[m.solverId])(m.phi)(m.solveResults)]
                .map(r => MechanismService.deriveMechInfo(m.links, r));

            console.log(`found ${results.length} results in ${t + performance.now()}`)
            this.store.dispatch(new SolveResultsUpdateAction(results));
        });
    }

    private solveFor(loops: ReadonlyArray<Loop>, solver: MetaSolveFunc)
    {
        const minTries = loops.reduce((l, r) => l + r.length, 0) ** 2;
        const solve = solver(loops);

        return function(guide: [string, number])
        {
            guide = [...guide] as [string, number];
            const knownResults: SolveResults = [];

            const varMap = new Map<string, Variable>(
                _.sortBy(loops.flatMap(loop => loop
                        .filter(v => v.isUndefined && v.id !== guide[0])
                        .map(v => [v.id, v] as [string, Variable])), [0])
            );
            const vars = Object.freeze([...varMap.values()]);
            function comp(l: SolveResult, r: SolveResult)
            {
                for (const k of varMap.keys())
                {
                    const diff = l[k].q - r[k].q;
                    if (Math.abs(diff) > 1e-2)
                    {
                        return diff;
                    }
                }
                return 0;
            }

            const isAngle = vars.reduce(
                (map, v) => ({...map, [v.id]: v.absAngle === undefined }),
                {} as Dictionary<boolean>
            );

            return function* multiSolve(start: SolveResults)
            {
                start = [...start];
                for (const r of knownResults)
                {
                    yield r;
                }

                const limit = start.length + minTries;
                for (let i = 0; i < limit; ++i)
                {
                    let r = exhaust(solve(guide, start[i]), 32);
                    if (r === undefined)
                    {
                        continue;
                    }

                    // sanitize angles to [0, 2*PI]
                    r = [...varMap.keys()].reduce((o, vid) => {
                        let vr = r[vid];
                        if (isAngle[vid])
                        {
                            let q = vr.q;
                            q %= 2 * Math.PI;
                            if (q < 0)
                            {
                                q += 2 * Math.PI;
                            }
                            vr = Object.freeze({...vr, q});
                        }
                        return dict.add(o, vid, vr);
                    }, dict.create<LinkInfo>());

                    r = dict.add(r, guide[0], {
                        q: guide[1],
                        v: 1,
                        a: 0,
                        points: []
                    });

                    if (knownResults.findIndex((cr) => comp(cr, r) === 0) === -1)
                    {
                        knownResults.push(r);
                        yield r;
                    }
                }
            }
        }
    }

    private static deriveMechInfo(links: dict.Dictionary<Link>, q_i: SolveResult)
    {
        function getAngle(link: Link, info: LinkInfo)
        {
            return link.absAngle === undefined ? info.q : link.absAngle;
        }
        function getFirstLength(link: Link, info: LinkInfo)
        {
            return link.edgeLengths.length ? link.edgeLengths[0] : -info.q;
        }

        function newPoint(s: Vector2, len: number, angle: number)
        {
            return {
                x: s.x + len * Math.cos(angle),
                y: s.y + len * Math.sin(angle)
            }
        }
        function newSpeed(v: Vector2, len: number, angle: number, linkInfo: LinkInfo)
        {
            return {
                x: v.x - linkInfo.v * len * Math.sin(angle),
                y: v.y + linkInfo.v * len * Math.cos(angle)
            };
        }
        function newAccel(a: Vector2, len: number, angle: number, linkInfo: LinkInfo)
        {
            return {
                x: a.x - linkInfo.a * len * Math.sin(angle) - linkInfo.v * linkInfo.v * len * Math.cos(angle),
                y: a.y + linkInfo.a * len * Math.cos(angle) - linkInfo.v * linkInfo.v * len * Math.sin(angle)
            };
        }

        function computeLink(link: Link): LinkInfo
        {
            let info = q_i[link.id];
            if (!info)
            {
                // fixed
                q_i = dict.add(q_i, link.id, (info = {
                    q: null,
                    v: 0,
                    a: 0,
                    points: [],
                }));
            }
            else if (info.points.length !== 0)
            {
                return info;
            }

            let start: MechPointInfo = {
                coordinates: { x: 0, y: 0 },
                velocity: { x:0, y: 0 },
                acceleration: { x:0, y:0 }
            };
            if (link.joint)
            {
                start = computeLink(links[link.joint.linkId]).points[link.joint.mountId];
            }

            const angle = getAngle(link, info);
            const len = getFirstLength(link, info);
            const points = info.points as MechPointInfo[];
            points.push(start, {
                coordinates: newPoint(start.coordinates, len, angle),
                velocity: newSpeed(start.velocity, len, angle, info),
                acceleration: newAccel(start.acceleration, len, angle, info)
            });
            for (let i = 1; i < link.points.length; ++i)
            {
                const p = link.points[i];
                points.push({
                    coordinates: newPoint(start.coordinates, p.length, angle + p.angleOffset),
                    velocity: newSpeed(start.velocity, p.length, angle + p.angleOffset, info),
                    acceleration: newAccel(start.acceleration, p.length, angle + p.angleOffset, info)
                });
            }

            points.shift();
            points.push(start);
            return info;
        }
        dict.elems(links).forEach(computeLink);
        return q_i;
    }
}
