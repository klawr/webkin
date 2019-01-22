import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StoreModule } from '@ngrx/store';
import { mechReducer } from './mech/mech.reducer';

import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { MechComponent } from './mech/mech.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
    declarations: [
        AppComponent,
        CanvasComponent,
        MechComponent,
        SidebarComponent,
    ],
    imports: [
        StoreModule.forRoot({ mech: mechReducer }),
        BrowserAnimationsModule,
        BrowserModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatInputModule,
        MatListModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatTabsModule,
        MatTooltipModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
