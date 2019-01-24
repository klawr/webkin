import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExampleService } from '../mech/examples.service';
import { Link } from '../mech/mech.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClearLinkAction } from '../mech/mech.actions';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styles: ['.stretch {width:100% }', '.setAngle { width:100% }']
})
export class SidebarComponent implements OnInit {

    constructor(
        public readonly exampleService: ExampleService,
        public readonly store: Store<AppState>
    ) { }

    loadMech(id: string)
    {
        this.exampleService.load(id);
    }
    clear()
    {
        this.store.dispatch(new ClearLinkAction());
    }

    links: Observable<Link[]>;

    ngOnInit()
    {
        const links = this.store.select(l => l.mech.links);
        this.links = links.pipe(map(links => Object.keys(links).map(k => links[k])));
    }

}
