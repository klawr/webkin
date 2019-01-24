import { Component, OnInit, Input } from '@angular/core';
import { Link } from '../mech/mech.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MutateLinkAction } from '../mech/mech.actions';

@Component({
    selector: 'app-link',
    templateUrl: './link.component.html',
    styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
    @Input() link: Link

    backup: Link;

    constructor(
        public readonly store: Store<AppState>
    ) { }

    // TODO: Preview angle should be aligned with absAngle

    joints: Observable<{ id: string, mpIds: Iterable<number> }[]>;
    edgeLengths = [] as number[];
    relAngles = [] as number[];
    selected: string;
    addEdge() {
        this.edgeLengths.push(0);
        this.relAngles.push(0);
        console.log(this.edgeLengths.length);
    }

    update(id: string, preview: number)
    {
        const mp = this.selected ? this.selected.split(' - ') : undefined;
        this.store.dispatch(new MutateLinkAction(id, {
            id: id,
            absAngle: preview,
            edgeLengths: this.edgeLengths,
            relAngles: this.relAngles,
            joint: this.selected ? {linkId: mp[0], mountId: +mp[1] } : undefined,
        }))
    }

    abort()
    {
        this.store.dispatch(new MutateLinkAction(this.backup.id, this.backup));
    }

    ngOnInit()
    {
        const links = this.store.select(l => l.mech.links);
        this.joints = links.pipe(map(links =>
            Object.keys(links).map(link => {
                return {
                    id: link,
                    mpIds: links[link].edgeLengths.map((_, i) => i)
                }
            })
        ));
        if (this.link) {
            this.backup =  Object.assign({}, this.link);

            this.selected = this.link.joint ? this.link.joint.linkId + ' - ' + this.link.joint.mountId : undefined;
            this.edgeLengths = [...this.link.edgeLengths];
            this.relAngles = [...this.link.relAngles];

        }
        else
        {
            this.edgeLengths.push(0);
        }
    }
}
