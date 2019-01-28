import { UiState } from './uistatate.model';
import { UiStateActions, UiStateActionType } from './uistate.actions';
import { MechanismStateActionType } from '../mech/mech.actions';
import { fac } from '../utils';


const initialState: UiState = fac({
    activeSolver: "xy",
    activeResultIndex: 0,
    activeTab: true,
})

export function uiStateReducer(state = initialState, action: UiStateActions)
{
    switch (action.type)
    {
        case UiStateActionType.SelectResult: {
            return fac(state, {
                activeResultIndex: action.resultIndex,
            });
        }

        case UiStateActionType.LinkTab: {
            return fac(state, {
                activeTab: action.linkTab,
            })
        }

        default: {
            return state;
        }
    }
}
