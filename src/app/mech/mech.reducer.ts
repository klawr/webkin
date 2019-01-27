
import { Action } from '@ngrx/store';
import { fac, fdac } from '../utils';
import * as dict from '../utils/dictionary';
import { ClearLinkAction, LinkActions, LinkActionTypes, LoopActions, LoopActionTypes, UndefineLinkAction, MechanismStateActionType, ReplaceMechanismStateAction, MechanismStateActions } from './mech.actions';
import { Link, LoopDefinition, Mountpoint, SolveResults, Variable, Loop, JointId } from './mech.model';
import { SolverId } from './solver.service';

export interface Dictionary<T>
{
    [id: string]: T;
}
export interface FuncDictionary<T>
{
    [id: number]: T;
}

export type DeeplyReadonly<T> = { readonly [P in keyof T]: Readonly<T[P]>; }

export interface MechState
{
    readonly phi?: DeeplyReadonly<[string, number]>;
    readonly solverId: SolverId;

    readonly solveResults: SolveResults;
    readonly links: dict.Dictionary<Link>;
    readonly loops: DeeplyReadonly<FuncDictionary<LoopDefinition>>;
    readonly loopCache?: ReadonlyArray<Loop>
}

const initialState: MechState = Object.freeze({
    solveResults: Object.freeze([]) as SolveResults,
    solverId: SolverId.XySolver,
    links: Object.freeze(Object.create(null)),
    loops: Object.freeze([])
});

export function sanitizeLink(link: Link): Link
{
    let edgeLengths = link.edgeLengths;
    const points: Mountpoint[] = [];
    if (typeof edgeLengths === 'undefined' || edgeLengths.length === 0)
    {
        points.push(fac({ angleOffset: 0 }));
        edgeLengths = [];
    }
    else
    {
        if (edgeLengths.length)
        {
            if (link.relAngles.length !== edgeLengths.length - 1)
            {
                throw new Error("angles.length !== length.length - 1");
            }
            points.push(fac({ length: edgeLengths[0], angleOffset: 0 }));
            let gammaOffset = 0;
            let beta = 0;
            for (let i = 1; i < edgeLengths.length; ++i)
            {
                const a = points[i-1].length;
                const b = edgeLengths[i];
                const gamma = link.relAngles[i-1] - gammaOffset;

                const c = Math.sqrt(a * a + b * b - Math.cos(gamma) * 2 * a * b);
                beta += Math.asin(Math.sin(gamma) * b / c);
                const alpha = Math.sin(Math.sin(gamma) * a / c);

                gammaOffset = alpha;
                points.push(fac({ length: c, angleOffset: beta }));
            }
        }
    }

    Object.freeze(edgeLengths);
    Object.freeze(points);
    return fac(link, { edgeLengths, points });
}

export function linkReducer(
    state:  dict.Dictionary<Link>,
    action: LinkActions
): dict.Dictionary<Link>
{
    switch (action.type)
    {
        case LinkActionTypes.Define: {
            return dict.add(state, action.data.id, sanitizeLink(action.data));
        }

        case LinkActionTypes.Undefine: {
            return dict.remove(state, action.id);
        }

        case LinkActionTypes.Mutate: {
            return dict.add(state, action.id, sanitizeLink(fac(state[action.id], action.data)));
        }

        case LinkActionTypes.Clear: {
            return dict.create();
        }

        default:
            return state;
    }
}

export function loopReducer(
    state: FuncDictionary<LoopDefinition>,
    action: LoopActions | UndefineLinkAction | ClearLinkAction
): FuncDictionary<LoopDefinition>
{
    switch (action.type)
    {
        case LoopActionTypes.Define: {
            return fac(state, { [action.id]: action.data });
        }
        case LoopActionTypes.Undefine: {
            return fdac(action.id, state);
        }

        case LinkActionTypes.Undefine: {
            for (const k in state)
            {
                if (state[k].left.linkId === action.id ||state[k].right.linkId === action.id)
                {
                    return fdac(k, state);
                }
            }
        }
        case LinkActionTypes.Clear: {
            return fac({});
        }

        default:
            return state;
    }
}

function reduceLoops(links: DeeplyReadonly<Dictionary<Link>>, defs: DeeplyReadonly<FuncDictionary<LoopDefinition>>): DeeplyReadonly<Loop[]>
{
    function formLoop(left: ReadonlyArray<Variable>, right: ReadonlyArray<Variable>): Loop
    {
        return [...left, ...right.map((e) => e.invert())]
    }

    function buildChain(joint: JointId)
    {
        let e = links[joint.linkId];
        let mp = e.points[joint.mountId];
        const s = [new Variable(joint.linkId, mp.angleOffset, e.absAngle, mp.length)];
        while (joint = e.joint)
        {
            e = links[joint.linkId];
            mp = e.points[joint.mountId];
            s.unshift(new Variable(joint.linkId, mp.angleOffset, e.absAngle, mp.length));
        }
        return Object.freeze(s);
    }

    try
    {
        const loops: Loop[] = [];
        for (const k in defs)
        {
            const loopIds = defs[k];
            const left  = buildChain(loopIds.left);
            const right = buildChain(loopIds.right);

            loops.push(formLoop(left, right));
        }
        Object.freeze(loops);
        return loops;
    }
    catch (err)
    {
        return undefined;
    }
}

export function mechReducer(state = initialState, action: MechanismStateActions)
{
    switch (action.type)
    {
        case MechanismStateActionType.UpdateSolveResults: {
            return fac(state, { solveResults: action.data });
        }
        case MechanismStateActionType.Replace: {
            let loopCache;
            if (action.data.loops !== state.loops || action.data.links !== state.links)
            {
                loopCache = reduceLoops(action.data.links, action.data.loops);
            }

            return fac(action.data, { loopCache, solveResults: Object.freeze([]) });
        }
        case MechanismStateActionType.ChangePhi: {
            return fac(state, {
                phi: Object.freeze([action.id, action.angle])
            });
        }
        case MechanismStateActionType.SwitchSolver: {
            return fac(state, {
                solverId: action.solverId,
            });
        }
        default: {
            const links = linkReducer(state.links, action as LinkActions);
            const loops = loopReducer(state.loops, action as LoopActions);

            if (loops !== state.loops || links !== state.links)
            {
                const loopCache = reduceLoops(links, loops);

                return fac(state, {
                    links,
                    loops,
                    loopCache,
                    solveResults: Object.freeze([]),
                });
            }
            else
            {
                return state;
            }
        }
    }
}

