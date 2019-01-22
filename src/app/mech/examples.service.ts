import { MechState, sanitizeLink, Dictionary } from "./mech.reducer";
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ClearLinkAction, ReplaceMechanismStateAction } from './mech.actions';

const examples: Dictionary<MechState> = {
    Stephenson2: {
        links: {
            'g0': sanitizeLink({ id:'g0', edgeLengths: [300], absAngle: 0, relAngles: [], points: []}),
            'a0': sanitizeLink({ id:'a0', edgeLengths: [100], relAngles: [], points: []}),
            'a1': sanitizeLink({ id:'a1', edgeLengths: [250, 100], relAngles:[Math.PI], points: [], joint: {linkId:'a0', mountId:0}}),
            'b1': sanitizeLink({ id:'b1', edgeLengths: [111.803], relAngles: [], points: [], joint: {linkId:'a1', mountId:0}}),
            'b2': sanitizeLink({ id:'b2', edgeLengths: [111.803], relAngles: [], points: [], joint: {linkId:'a1', mountId:1}}),
            'c1': sanitizeLink({ id:'c1', edgeLengths: [Math.SQRT1_2*100,100], relAngles:[Math.PI/4], points: [], joint: {linkId:'g0', mountId:0}})
        },
        loops: [{
            left: {linkId: 'b1', mountId:0},
            right: {linkId: 'c1', mountId:0}
        },{
            left: {linkId: 'b2', mountId: 0},
            right: {linkId: 'c1', mountId: 1}
        }],
        phi: ['a0', 0]
    },
}

@Injectable({
    providedIn: 'root',
})
export class ExampleService
{
    ids: string[] = Object.keys(examples);
    constructor(private readonly store: Store<AppState>) { }
    load(exampleId: string)
    {
        this.store.dispatch(new ClearLinkAction());
        this.store.dispatch(new ReplaceMechanismStateAction(examples[exampleId]));
    }
}
