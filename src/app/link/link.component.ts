import { Component, OnInit, Input } from '@angular/core';
import { Link, JointId } from '../mech/mech.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-link',
    templateUrl: './link.component.html',
    styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
    @Input() link: Link

    constructor(
        public readonly store: Store<AppState>
    ) { }

    // TODO: Preview angle should be aligned with absAngle

    joints: Observable<string[]>;

    addEdge() {
    }

    abort() {
    }

    ngOnInit()
    {
        // Implement this as https://material.angular.io/components/menu/overview#nested-menu
        const links = this.store.select(l => l.mech.links);
        this.joints = links.pipe(map(links =>
            Object.keys(links).flatMap(k =>
                links[k].edgeLengths.map((_, i) => links[k].id+' '+i))));
    }

}
