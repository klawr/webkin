import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';

import { StoreModule } from '@ngrx/store';
import { mechReducer } from './mech/mech.reducer';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { MechComponent } from './mech/mech.component';

@NgModule({
    declarations: [
        AppComponent,
        CanvasComponent,
        MechComponent,
    ],
    imports: [
        StoreModule.forRoot({ mech: mechReducer }),
        BrowserAnimationsModule,
        BrowserModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatTabsModule,
        ScrollDispatchModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
