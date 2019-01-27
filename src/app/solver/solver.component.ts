import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ChangePhiMechanismStateAction, SwitchSolverAction } from '../mech/mech.actions';
import { LoopDefinition, Link } from '../mech/mech.model';
import { FuncDictionary, Dictionary } from '../mech/mech.reducer';
import { SolverId } from '../mech/solver.service';
import { MatSelectChange } from '@angular/material/select';
@Component({
    selector: 'app-solver',
    templateUrl: './solver.component.html',
    styles: ['.stretch {width:100% }', '.setAngle { width:100% }']
})
export class SolverComponent implements OnInit {

    constructor(
        public readonly store: Store<AppState>
    ) {
        this.guide = this.store.select(l => l.mech.phi ? l.mech.phi[0] : null);
        this.guideNotDefined = this.guide.pipe(map(g => g === null));
        this.selectedSolver = this.store.select(s => s.mech.solverId);
    }

    loops: Observable<FuncDictionary<LoopDefinition>>;
    links: Observable<Link[]>;
    guide: Observable<string>;
    guideNotDefined: Observable<boolean>;
    solver: string[] = Object.values(SolverId);
    selectedSolver: Observable<SolverId>;

    joints: Observable<{ id: string, mpIds: Iterable<number> }[]>;
    from: string;
    to: string;

    changePhi = (phi: string, value: number) =>
    {
        const t = value / 180 * Math.PI;
        this.store.dispatch(new ChangePhiMechanismStateAction(phi, t));
    }
    addConnection()
    {

    }

    onSolverChange(event: MatSelectChange)
    {
        this.store.dispatch(new SwitchSolverAction(event.value));
    }

    ngOnInit() {
        this.loops = this.store.select(l => l.mech.loops);

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
