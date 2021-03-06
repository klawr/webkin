import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StoreModule } from '@ngrx/store';
import { mechReducer } from './mech/mech.reducer';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { MechComponent } from './mech/mech.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LinkComponent } from './link/link.component';
import { SolverComponent } from './solver/solver.component';
import { SolveResultsComponent } from './solve-results/solve-results.component';
import { uiStateReducer } from './model/uistate.reducer';

@NgModule({
    declarations: [
        AppComponent,
        CanvasComponent,
        MechComponent,
        SidebarComponent,
        LinkComponent,
        SolverComponent,
        SolveResultsComponent,
    ],
    imports: [
        StoreModule.forRoot({
            mech: mechReducer,
            uiState: uiStateReducer,
        }),
        BrowserAnimationsModule,
        BrowserModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
