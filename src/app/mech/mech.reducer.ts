
import { Action } from '@ngrx/store';
import { fac, fdac } from '../utils';
import { ClearLinkAction, LinkActions, LinkActionTypes, LoopActions, LoopActionTypes, UndefineLinkAction } from './mech.actions';
import { Link, LoopDefinition, Mountpoint } from './mech.model';


export interface Dictionary<T>
{
    [id: string]: T;
}
export interface FuncDictionary<T>
{
    [id: number]: T;
}

export interface MechState
{
    phi?: [string, number];
    links: Dictionary<Link>;
    loops: FuncDictionary<LoopDefinition>;
}

const initialState: MechState = Object.freeze({
    links: Object.freeze(Object.create(null)),
    loops: Object.freeze([])
});

function sanitizeLink(link: Link): Link
{
    let edgeLengths = link.edgeLengths;
    const points: Mountpoint[] = [];
    if (typeof edgeLengths === 'undefined')
    {
        points.push(fac({}));
        edgeLengths = [];
    }
    else
    {
        if (link.edgeLengths.length)
        {
            if (link.relAngles.length !== link.edgeLengths.length - 1)
            {
                throw new Error("angles.length !== length.length - 1");
            }
            points.push(fac({ length: link.edgeLengths[0] }));
            let gammaOffset = 0;
            let beta = 0;
            for (let i = 1; i < this.length.length; ++i)
            {
                const a = this.points[i-1].length;
                const b = this.length[i];
                const gamma = this.relAngles[i-1] - gammaOffset;

                const c = Math.sqrt(a * a + b * b - Math.cos(gamma) * 2 * a * b);
                beta += Math.asin(Math.sin(gamma) * b / c);
                const alpha = Math.sin(Math.sin(gamma) * a / c);

                gammaOffset = alpha;
                points.push(fac({ length: c, angle: beta }));
            }
        }
    }

    Object.freeze(edgeLengths);
    Object.freeze(points);
    return fac(link, { edgeLengths, points });
}

export function linkReducer(
    state:  Dictionary<Link>,
    action: LinkActions
): Dictionary<Link>
{
    switch (action.type)
    {
        case LinkActionTypes.Define: {
            return fac(state, { [action.data.id]: sanitizeLink(action.data) });
        }

        case LinkActionTypes.Undefine: {
            return fdac(action.id, state);
        }

        case LinkActionTypes.Mutate: {
            return fac(state, {
                [action.id]: sanitizeLink(fac(state[action.id], action.data))
            });
        }

        case LinkActionTypes.Clear: {
            return fac({});
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

export function mechReducer(state = initialState, action: Action)
{
    return fac(state, {
        links: linkReducer(state.links, action as LinkActions),
        loops: loopReducer(state.loops, action as LoopActions)
    })
}
