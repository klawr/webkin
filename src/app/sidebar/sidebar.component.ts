import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExampleService } from '../mech/examples.service';
import { JointId, Link } from '../mech/mech.model';
import { ChangePhiMechanismStateAction } from '../mech/mech.actions';

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

    linklength = [] as number[];

    links = [] as Link[];

    angles = [] as number[];

    joints = [] as JointId[];

    changePhi = (value: number) =>
    {
        const t = value / 180 * Math.PI;
        this.store.dispatch(new ChangePhiMechanismStateAction('a0', t));
    }

    addEdge()
    {
        this.linklength.push(0);
        console.log(this.linklength);
    }

    abort()
    {
        this.linklength = [] as number[];
    }

    ngOnInit()
    {
    }

}
