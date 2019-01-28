
import { Action } from '@ngrx/store';
import { SolveResultsUpdateAction } from '../mech/mech.actions';

export enum UiStateActionType
{
    SelectResult = 'uistate/result/select',
    LinkTab = 'uistate/activeTab/link'
}

export class UiStateSelectResult implements Action
{
    readonly type = UiStateActionType.SelectResult;

    constructor(public readonly resultIndex: number) {}
}

export class UiStateChangeTabAction implements Action
{
    readonly type = UiStateActionType.LinkTab;

    constructor(public readonly linkTab: boolean) {}
}

export type UiStateActions
    = UiStateSelectResult
    | UiStateChangeTabAction;
