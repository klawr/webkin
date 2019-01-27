
import { Component, OnInit } from '@angular/core';
import { g2 } from 'g2d';
import { Observable } from 'rxjs';
import { MechanismService } from "./mech.service";
import { map, filter, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { Dictionary, MechState } from './mech.reducer';
import { Link, SolveResult, SolveResults } from './mech.model';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import * as dict from '../utils/dictionary';


@Component({
    selector: 'app-mech',
    templateUrl: './mech.component.html',
    styleUrls: []
})
export class MechComponent implements OnInit
{
    renderCommands: Observable<g2>;

    constructor(
        private store: Store<AppState>,
        private mechService: MechanismService
    ) {
        this.renderCommands = this.store.select(s => s.mech.solveResults).pipe(
            distinctUntilChanged(),
            filter(r => r && r.length > 0),
            withLatestFrom(this.store.select(s => s.mech).pipe(distinctUntilChanged())),
            map(([results, links]) => this.renderCombine(links, results))
        );
    }

    ngOnInit(): void
    {
    }
    private renderCombine(mech: MechState, q_i: SolveResults)
    {
        const rcmds = g2().view({x:650,y:400,cartesian:true});

        // rcmds.grid({});

        const colors = ['#000','#00f','#0f0','#f00','#0ff','#f0f','#ff0','#fff'];
        [...q_i].reverse().forEach((v,i) => {
            this.render(mech.links, v, rcmds, colors[i] || '#fff', mech.phi ? mech.phi[0] : undefined)
        });

        rcmds.gnd({});
        return rcmds;
    }

    private render(links: Dictionary<Link>, q_i: SolveResult, rcmds: g2, color: string, guideId: string)
    {
        dict.forEach(q_i, (q_i_j, j) =>
        {
            const pts = q_i_j.points.map(p => p.coordinates);
            if (!fixed(links[j]))
            {
                const lcolor = j === guideId ? '#fff' : color;
                // @ts-ignore
                rcmds.ply({pts,fs:lcolor+'3',ls:lcolor,closed:true,lw:2});
            }
            else
            {
                // @ts-ignore
                rcmds.ply({pts,ld:g2.symbol.dashdot});
            }
        })

        function fixed(link: Link)
        {
            return link.absAngle !== undefined;
        }
    }
}
