
import { Action } from '@ngrx/store';
import { SolveResultsUpdateAction } from '../mech/mech.actions';

export enum UiStateActionType
{
    SelectResult = 'uistate/result/select',
}

export class UiStateSelectResult implements Action
{
    readonly type = UiStateActionType.SelectResult;

    constructor(public readonly resultIndex: number) {}
}

export type UiStateActions
    = UiStateSelectResult;
