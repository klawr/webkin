import { Component, OnInit } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { SolveResults, SolveResult } from '../mech/mech.model';
import { Observable, combineLatest } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { map, filter } from 'rxjs/operators';
import * as dict from '../utils/dictionary';
import { MatSelectChange } from '@angular/material/select';
import { UiStateSelectResult } from '../model/uistate.actions';
import { colors } from '../mech/mech.component';

const resultSelector = createSelector(
    (s: AppState) => s.uiState.activeResultIndex,
    (s: AppState) => s.mech.solveResults,
    (resultIndex, results) => {
        resultIndex = Math.min(resultIndex, results.length - 1);
        if (resultIndex < 0)
        {
            return undefined;
        }
        return dict.filter(results[resultIndex], (v) => v.q !== null);
    }
)

@Component({
    selector: 'app-solve-results',
    templateUrl: './solve-results.component.html',
    styles: ['.stretch {width:100% }']
})
export class SolveResultsComponent implements OnInit {

    constructor(
        public readonly store: Store<AppState>
    ) {
        this.solveResult = this.store.select(resultSelector).pipe(filter(r => r !== undefined));
        this.linkResultDataSource = new LinkResultDataSource(this.solveResult);
        this.pointResultDataSource = new PointResultDataSource(this.solveResult);

        this.selectedResultIndex = this.store.select(s => s.uiState.activeResultIndex);
        this.resultIndices = this.store.select(s => s.mech.solveResults).pipe(
            map(results => results.map((r, i) => [i, colors[i]] as [number, string]))
        );
    }

    solveResult: Observable<SolveResult>
    linkResultDataSource: LinkResultDataSource;
    pointResultDataSource: PointResultDataSource;

    selectedResultIndex: Observable<number>;
    resultIndices: Observable<[number, string][]>;

    ngOnInit()
    {
    }

    onResultSelectionChange(event: MatSelectChange)
    {
        this.store.dispatch(new UiStateSelectResult(event.value));
    }
}

function round(x: number)
{
    return Math.round(x * 100) / 100;
}

class LinkResultDataSource extends DataSource<LinkTableRow> {

    rows: Observable<LinkTableRow[]>;
    constructor(result: Observable<SolveResult>)
    {
        super();
        this.rows = result.pipe(
            map(result => dict.elems(dict.map(result, (v, id) => ({
                id,
                q: round(v.q),
                v: round(v.v),
                a: round(v.a)
            }))))
        );
    }

    connect(): Observable<LinkTableRow[]> {
        return this.rows;
    }
    disconnect() {};
    cols = ['id','q','omega','omegax'];
}

interface LinkTableRow
{
    id: string;
    q: number;
    v: number;
    a: number;
}

class PointResultDataSource extends DataSource<PointTableRow>
{
    rows: Observable<PointTableRow[]>;
    constructor(result: Observable<SolveResult>)
    {
        super();
        this.rows = result.pipe(
            map(result => dict.elems(dict.map(result, (v, id) => v.points.filter((p, i, ps) => i !== ps.length - 1).map((p, i) => ({
                id: `${id}-${i}`,
                v: `${round(p.velocity.x)} | ${round(p.velocity.y)}`,
                a: `${round(p.acceleration.x)} | ${round(p.acceleration.y)}`
            })))).flat())
        );
    }
    connect(): Observable<PointTableRow[]> {
        return this.rows;
    }
    disconnect() {};
    cols = ['id','vx/vy','ax/ay'];
}

interface PointTableRow
{
    id: string;
    v: string;
    a: string;
}
