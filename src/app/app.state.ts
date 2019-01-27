import { MechState } from './mech/mech.reducer';
import { UiState } from './model/uistatate.model';

export interface AppState
{
    mech: MechState;
    uiState: UiState;
}
