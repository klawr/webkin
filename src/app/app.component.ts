import { Component } from '@angular/core';
import { g2 } from 'g2d';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: []
})
export class AppComponent {
    title = 'angular';
    g = new Subject<g2>();
}
