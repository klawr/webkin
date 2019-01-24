import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangePhiMechanismStateAction } from '../mech/mech.actions';
import { LoopDefinition, Link } from '../mech/mech.model';
import { FuncDictionary, Dictionary } from '../mech/mech.reducer';
@Component({
    selector: 'app-solver',
    templateUrl: './solver.component.html',
    styles: ['.stretch {width:100% }', '.setAngle { width:100% }']
})
export class SolverComponent implements OnInit {

    constructor(
        public readonly store: Store<AppState>
    ) { }

    loops: Observable<FuncDictionary<LoopDefinition>>;
    links: Observable<Link[]>;
    phi: Observable<string>;

    joints: Observable<{ id: string, mpIds: Iterable<number> }[]>;
    from: string;
    to: string;

        test(l: any){
            console.log(l);
        }

    changePhi = (phi: string, value: number) =>
    {
        const t = value / 180 * Math.PI;
        this.store.dispatch(new ChangePhiMechanismStateAction(phi, t));
    }
    addConnection()
    {

    }

    ngOnInit() {
        this.loops = this.store.select(l => l.mech.loops);

        const phi = this.store.select(l => l.mech.phi);
        this.phi = phi.pipe(map(l => l[0]));
        const links = this.store.select(l => l.mech.links);
        this.links = links.pipe(map(links =>
            Object.keys(links).map(k =>
                links[k]).filter(l =>
                    l.absAngle === undefined)));

        this.joints = links.pipe(map(links =>
            Object.keys(links).map(link => {
                return {
                    id: link,
                    mpIds: links[link].edgeLengths.map((_, i) => i)
                }
            })
        ));
    }
}
