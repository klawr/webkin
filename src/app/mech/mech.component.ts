
import { Component, OnInit } from '@angular/core';
import { g2 } from 'g2-module';
import { Observable } from 'rxjs';
import { MechanismService } from "./mech.service";
import { map, filter, distinctUntilChanged, withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Dictionary, MechState } from './mech.reducer';
import { Link, SolveResult, SolveResults } from './mech.model';
import { AppState } from '../app.state';
import { Store } from '@ngrx/store';
import * as dict from '../utils/dictionary';

export const colors = ['#000','#00f','#0f0','#f00','#0ff','#f0f','#ff0','#fff'];

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
        const solveResults = this.store.select(s => s.mech.solveResults).pipe(distinctUntilChanged());
        const resIdx = this.store.select(s => s.uiState.activeResultIndex).pipe(distinctUntilChanged());
        const label = this.store.select(s => s.uiState.activeTab).pipe(distinctUntilChanged());

        this.renderCommands = combineLatest(solveResults, resIdx, label).pipe(
            filter(r => r[0] && r[0].length > 0),
            withLatestFrom(this.store.select(s => s.mech).pipe(distinctUntilChanged())),
            map(([results, links]) => this.renderCombine(links, results[0], results[1], results[2]))
        );
    }

    ngOnInit(): void
    {
    }
    private renderCombine(mech: MechState, q_i: SolveResults, resIdx: number, label: boolean)
    {
        const rcmds = g2().view({x:650,y:400,cartesian:true});

        // rcmds.grid({});

        const clrs = [...colors];

        [...q_i].forEach((v,i) => {
            this.render(mech.links, v, rcmds,
                clrs[i] ? clrs[i] += resIdx === i ? 'f':'4' : resIdx === i ? '#ffff': '#fff4',
                mech.phi ? mech.phi[0] : undefined,
                label)
        });

        rcmds.gnd({});
        return rcmds;
    }

    private render(links: Dictionary<Link>, q_i: SolveResult, rcmds: g2, color: string, guideId: string, label: boolean)
    {
        dict.forEach(q_i, (q_i_j, j) =>
        {
            const pts = q_i_j.points.map(p => p.coordinates);
            if (!fixed(links[j]))
            {


                const darkmode = false;


                const guideColor = darkmode ? '#ffff' : '#000f';
                const ls = j === guideId ? guideColor : color;
                const fs = ls[4] === 'f' ? ls.replace(/.$/,'3') : ls.replace(/.$/,'0');
                const lw = ls[4] === 'f' ? 4 : 2;
                // @ts-ignore
                rcmds.ply({pts,fs,ls,lw,closed:true});
                if (color[4] === 'f')
                {
                    if (label)
                    {
                        // @ts-ignore
                        rcmds.label({str:`${links[j].id}`,font:'25px serif', fs:color,loc:'n'});
                        pts.forEach(pt => rcmds.nod(pt));
                    }
                    else
                    {
                        pts.filter((_,i) => i < pts.length -1)
                           .forEach((pt,i) =>
                                rcmds.nod(pt).label({
                                    str:`${links[j].id}(${i})`,
                                    // @ts-ignore
                                    font:'25px serif',
                                    fs:color,
                                    loc:'n'
                                })
                            )
                    }
                }
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
