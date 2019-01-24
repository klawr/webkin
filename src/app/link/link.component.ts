import { Component, OnInit, Input } from '@angular/core';
import { Link, Mountpoint } from '../mech/mech.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MutateLinkAction, DefineLinkAction } from '../mech/mech.actions';

@Component({
    selector: 'app-link',
    templateUrl: './link.component.html',
    styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
    @Input() link: Link;

    constructor(
        public readonly store: Store<AppState>
    ) { }

    joints: Observable<{ id: string, mpIds: Iterable<number> }[]>;
    id: string;
    edgeLengths = [] as number[];
    relAngles = [] as number[];
    selected: string;

    addEdge()
    {
        this.edgeLengths.push(0);
        this.relAngles.push(0);
    }
    removeEdge()
    {
        this.edgeLengths.pop();
        this.relAngles.pop();
    }

    alterValue(length: boolean, idx: number, val: string)
    {
        const arr = length ? this.edgeLengths : this.relAngles;
        arr[idx] = +val;
    }

    buildLink(id: string)
    {
        const mp = this.selected ? this.selected.split(' - ') : undefined;
        return {
            id,
            edgeLengths: this.edgeLengths,
            relAngles: this.relAngles,
            joint: mp ? {linkId: mp[0], mountId: +mp[1] } : undefined,
            points: [] as Mountpoint[]
        };
    }

    defineLink(id: string)
    {
        this.store.dispatch(new DefineLinkAction(this.buildLink(id)));
        this.clearInputs(false);
    }

    mutateLink(id: string)
    {
        this.store.dispatch(new MutateLinkAction(this.link.id, this.buildLink(id)));
    }

    clearInputs(e: boolean)
    {
        if (e)
        {
            this.id = this.link.id;
            this.selected = this.link.joint ? this.link.joint.linkId + ' - ' + this.link.joint.mountId : undefined;
            this.edgeLengths = [...this.link.edgeLengths];
            this.relAngles = [...this.link.relAngles];
        }
        else
        {
            this.id = "";
            this.selected = undefined;
            this.edgeLengths = [0];
            this.relAngles = [];
        }
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
        this.clearInputs(!!this.link);
    }
}
