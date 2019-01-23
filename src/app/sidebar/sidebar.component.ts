import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExampleService } from '../mech/examples.service';
import { JointId, Link } from '../mech/mech.model';
import { ChangePhiMechanismStateAction } from '../mech/mech.actions';
import { Observable } from 'rxjs';
import { Dictionary } from '../mech/mech.reducer';
import { map } from 'rxjs/operators';

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

    changePhi = (value: number) =>
    {
        const t = value / 180 * Math.PI;
        this.store.dispatch(new ChangePhiMechanismStateAction('a0', t));
    }

    links: Observable<Link[]>;

    angles = [] as number[];
    linklength = [] as number[];
    joints = [] as JointId[];

    addEdge()
    {
        this.linklength.push(0);
    }

    abort()
    {
        this.linklength = [] as number[];
    }


    ngOnInit()
    {
        const links = this.store.select(l => l.mech.links);
        this.links = links.pipe(map(links => Object.keys(links).map(k => links[k])))
    }

}
