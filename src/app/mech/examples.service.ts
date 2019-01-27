import { MechState, sanitizeLink, Dictionary } from "./mech.reducer";
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ClearLinkAction, ReplaceMechanismStateAction } from './mech.actions';
import * as dict from '../utils/dictionary';

function cos(a:number,b:number,c:number)
{
    return Math.acos((a*a + b*b - c*c) / (2 * a * b));
}

const examples: Dictionary<MechState> = {
    Stephenson2: {
        solveResults: [],
        links: dict.create({
            'g0': sanitizeLink({ id:'g0', edgeLengths: [300], absAngle: 0, relAngles: [], points: []}),
            'a0': sanitizeLink({ id:'a0', edgeLengths: [100], relAngles: [], points: []}),
            'a1': sanitizeLink({ id:'a1', edgeLengths: [250, 100], relAngles:[Math.PI], points: [], joint: {linkId:'a0', mountId:0}}),
            'b1': sanitizeLink({ id:'b1', edgeLengths: [111.803], relAngles: [], points: [], joint: {linkId:'a1', mountId:0}}),
            'b2': sanitizeLink({ id:'b2', edgeLengths: [111.803], relAngles: [], points: [], joint: {linkId:'a1', mountId:1}}),
            'c1': sanitizeLink({ id:'c1', edgeLengths: [Math.SQRT1_2*100,100], relAngles:[Math.PI/4], points: [], joint: {linkId:'g0', mountId:0}})
        }),
        loops: [{
            left: {linkId: 'b1', mountId:0},
            right:{linkId: 'c1', mountId:0}
        },{
            left: {linkId: 'b2', mountId: 0},
            right:{linkId: 'c1', mountId: 1}
        }],
        phi: ['a0', 0]
    },
    Stephenson2_Linear: {
        solveResults: [],
        links: dict.create({
            'r1': sanitizeLink({ id:'r1', edgeLengths: [100], absAngle: Math.PI/2, relAngles: [], points: [], joint: {linkId:'r6', mountId:0} }),
            'r2': sanitizeLink({ id:'r2', edgeLengths: [180,180], relAngles: [2], points: []}),
            'r3': sanitizeLink({ id:'r3', edgeLengths: [170], relAngles: [], points: [], joint: {linkId:'r2', mountId:1} }),
            'r4': sanitizeLink({ id:'r4', edgeLengths: [250,150],relAngles: [Math.asin(0.5)], points: [], joint: {linkId:'r1', mountId:0} }),
            'r5': sanitizeLink({ id:'r5', edgeLengths: [150], relAngles: [], points: [], joint: {linkId:'r2', mountId:0} }),
            'r6': sanitizeLink({ id:'r6', edgeLengths: [], absAngle: 0, relAngles: [], points: [] }),
        }),
        loops: [{
            left: {linkId: 'r5', mountId: 0},
            right:{linkId: 'r4', mountId: 1}
        },{
            left: {linkId: 'r3', mountId: 0},
            right:{linkId: 'r4', mountId: 0}
        }],
        phi: ['r2',Math.PI/4]
    },
    Fourbar: {
        solveResults: [],
        links: dict.create({
            'A0A': sanitizeLink({ id: 'A0A', edgeLengths: [Math.SQRT2 * 100], relAngles: [], points: []}),
            'AB':  sanitizeLink({ id: 'AB',  edgeLengths: [200,Math.sqrt(5)*100], relAngles: [Math.atan2(1,2)], points: [], joint: {linkId: 'A0A', mountId: 0}}),
            'B0B': sanitizeLink({ id: 'B0B', edgeLengths: [300], relAngles: [], points: [], joint: {linkId: 'GND', mountId: 0}}),
            'GND': sanitizeLink({ id: 'GND', edgeLengths: [500], relAngles: [], points: [], absAngle:Math.atan2(300,400)})
        }),
        loops: [{
            left: {linkId: 'AB', mountId: 0},
            right: {linkId: 'B0B', mountId: 0}
        }],
        phi: ['A0A', 0]
    },
    CouplingGear: {
        solveResults: [],
        links: dict.create({
            'g0': sanitizeLink({ id: 'g0', edgeLengths: [Math.hypot(300,450), Math.hypot(300,550)], absAngle: Math.atan2(11,6), relAngles: [cos(Math.hypot(6,9),Math.hypot(6,11),2)], points: [] }),
            'r5': sanitizeLink({ id: 'r5', edgeLengths: [300], relAngles: [], points: [], joint: {linkId: 'g0', mountId: 0} }),
            'r3': sanitizeLink({ id: 'r3', edgeLengths: [Math.hypot(100,250)], relAngles: [], points: [], joint: {linkId: 'r5', mountId:0}}),
            'r1': sanitizeLink({ id: 'r1', edgeLengths: [Math.hypot(100,200), Math.hypot(150,100)], relAngles: [cos(Math.hypot(2,4),Math.hypot(3,2),Math.hypot(5,2))], points: [], joint: {linkId: 'g0', mountId: 1}}),
            'r2': sanitizeLink({ id: 'r2', edgeLengths: [Math.SQRT2*200], relAngles: [], points: [], joint: {linkId: 'rc', mountId: 0} }),
            'rc': sanitizeLink({ id: 'rc', edgeLengths: [], relAngles: [], absAngle: 0, points: []})
        }),
        loops: [{
            left: {linkId: 'r3', mountId: 0},
            right:{linkId: 'r1', mountId: 0}
        }, {
            left: {linkId: 'r2', mountId: 0},
            right:{linkId: 'r1', mountId: 1},
        }],
        phi: ['r1', 2]
    }
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
