import { Injectable } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import { from, Observable, pipe, Subscriber } from 'rxjs';
import { switchAll, switchMap, take, map } from 'rxjs/operators';
import { AppState } from '../app.state';
import { JointId, Loop, Variable } from './mech.model';
import { SolveResult, xySolver } from './solver.service';
import { MechState } from './mech.reducer';

function formLoop(left: ReadonlyArray<Variable>, right?: ReadonlyArray<Variable>): Loop
{
    return [...left, ...right.map((e) => e.invert())]
}

export const selectPhi = (state: AppState) => state.mech.phi;
export const selectMech = (state: AppState) => state.mech;
export const selectLoops = createSelector(
    selectMech,
    (mech) => {
        function buildChain(joint: JointId)
        {
            let e = mech.links[joint.linkId];
            let mp = e.points[joint.mountId];
            const s = [new Variable(joint.linkId, mp.angleOffset, e.absAngle, mp.length)];
            while (joint = e.joint)
            {
                e = mech.links[joint.linkId];
                mp = e.points[joint.mountId];
                s.unshift(new Variable(joint.linkId, mp.angleOffset, e.absAngle, mp.length));
            }
            return Object.freeze(s);
        }

        const loops: Loop[] = [];
        for (const k in mech.loops)
        {
            const loopIds = mech.loops[k];
            const left  = buildChain(loopIds.left);
            const right = buildChain(loopIds.right);

            loops.push(formLoop(left, right));
        }
        return Object.freeze([mech, Object.freeze(loops)]) as [MechState, ReadonlyArray<Loop>];
    }
);

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
    readonly loops: Observable<[MechState, ReadonlyArray<Loop>]>;
    readonly solveResult: Observable<[MechState, SolveResult]>;

    constructor(private readonly store: Store<AppState>)
    {
        this.loops = this.store.select(selectLoops);
        this.solveResult = this.loops.pipe(
            map(([mech, loops]) => {
                if (!mech.phi)
                {
                    return [mech, Object.create(null)] as [MechState, SolveResult];
                }
                // TODO var exhaust
                return [mech, exhaust(xySolver(loops)(mech.phi), 42)] as [MechState, SolveResult]
            })
        );
    }
}
