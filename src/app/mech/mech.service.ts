import { Injectable } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import { AppState } from '../app.state';
import { JointId, Loop, Variable, SolveResult } from './mech.model';
import { xySolver, nearlyEqual } from './solver.service';
import { MechState, Dictionary } from './mech.reducer';
import { SolveResultsUpdateAction } from './mech.actions';



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
            distinctUntilChanged((l, r) => l.loopCache === r.loopCache && l.phi === r.phi)
        ).subscribe(m => {
            const ins = [...m.solveResults];
            const solver = xySolver(m.loopCache as any);

            let t = -performance.now();
            let results: SolveResult[] = [];
            for (let i = 0; i < 128; ++i)
            {
                results[i] = exhaust(solver(m.phi, ins[i]), 64);
            }

            const varLinkIds = Object.keys(results.find(r => !!r) || {});
            if (!varLinkIds.length)
            {
                return;
            }
            varLinkIds.sort();

            const isAngle = varLinkIds.reduce((map, k) => ({...map, [k]: m.links[k].absAngle === undefined }), {} as Dictionary<boolean>);

            function comp(l: SolveResult, r: SolveResult)
            {
                for (const k of varLinkIds)
                {
                    const diff = l[k].q - r[k].q;
                    if (Math.abs(diff) > 1e-2)
                    {
                        return diff;
                    }
                }
                return 0;
            }

            results.forEach(r => r && varLinkIds.forEach(k => {
                if (isAngle[k])
                {
                    r[k].q %= 2 * Math.PI;
                    if (r[k].q < 0)
                    {
                        r[k].q += 2 * Math.PI;
                    }
                }
            }));

            results.sort(comp);
            const numResults = results.findIndex((v) => !v);
            numResults >= 0 && (results.length = numResults);

            results = results.filter(function(item, pos, self) {
                return self.findIndex((v) => comp(v, item) === 0) === pos;
            })

            console.log(`found ${results.length} results in ${t + performance.now()}`)
            this.store.dispatch(new SolveResultsUpdateAction(results));
        });
    }
}
