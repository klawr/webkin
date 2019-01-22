import { Action } from '@ngrx/store';

import { Link, LoopDefinition } from './mech.model'
import { MechState } from './mech.reducer';

export enum LinkActionTypes
{
    Define = 'mech/links/define',
    Undefine = 'mech/links/undefine',
    Clear = 'mech/links/clear',
    Mutate = 'mech/links/mutate',
}

export class DefineLinkAction implements Action
{
    readonly type = LinkActionTypes.Define;

    constructor(public readonly data: Link)
    {
        Object.freeze(this.data);
        Object.freeze(this.data.joint);
        Object.freeze(this.data.points);
        Object.freeze(this.data.relAngles);
        Object.freeze(this.data.edgeLengths);
    }
}

export class UndefineLinkAction implements Action
{
    readonly type = LinkActionTypes.Undefine;

    constructor(public readonly id: string) {}
}

export class ClearLinkAction implements Action
{
    readonly type = LinkActionTypes.Clear;
}

export class MutateLinkAction implements Action
{
    readonly type = LinkActionTypes.Mutate;

    constructor(
        public readonly id: string,
        public readonly data: Partial<Link>
    ) {}
}

export type LinkActions
    = DefineLinkAction
    | UndefineLinkAction
    | ClearLinkAction
    | MutateLinkAction;


export enum LoopActionTypes
{
    Define = 'mech/loops/define',
    Undefine = 'mech/loops/undefine',
}

export class DefineLoopAction implements Action
{
    readonly type = LoopActionTypes.Define;

    constructor(
        public readonly id: number,
        public readonly data: LoopDefinition,
    )
    {
        Object.freeze(this.data);
    }
}

export class UndefineLoopAction implements Action
{
    readonly type = LoopActionTypes.Undefine;

    constructor(public readonly id: number) {}
}

export type LoopActions
    = DefineLoopAction
    | UndefineLoopAction;

export enum MechanismStateActionType
{
    ChangePhi = 'mech/mechanismstate/changePhi',
    Replace = 'mech/mechanismstate/replace',
}

export class ReplaceMechanismStateAction implements Action
{
    readonly type = MechanismStateActionType.Replace;
    constructor(public readonly data: MechState) {}
}

export class ChangePhiMechanismStateAction implements Action
{
    readonly type = MechanismStateActionType.ChangePhi;
    constructor(public readonly id: string, public readonly angle: number) {}
}

export type MechanismStateActions
    = ReplaceMechanismStateAction
    | ChangePhiMechanismStateAction
    | LoopActions
    | LinkActions;
