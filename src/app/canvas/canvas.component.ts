import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';

import { g2 } from 'g2-module';
import { Observable, Subject, ConnectableObservable, asapScheduler, BehaviorSubject } from 'rxjs';
import { publishBehavior, first, takeUntil, delay } from 'rxjs/operators';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, AfterViewInit, OnDestroy
{
    @Input() renderCommands: Observable<g2>;

    @ViewChild('canvasWrapper') canvasWrapper: ElementRef;
    @ViewChild('renderCanvas') canvasRef: ElementRef;
    private renderingCtx: CanvasRenderingContext2D;

    private commandCache: Observable<g2>;
    private destructionSubject = new Subject<undefined>();

    constructor() { }

    ngOnInit(): void
    {
        this.commandCache = this.renderCommands.pipe(
            takeUntil(this.destructionSubject),
            publishBehavior(g2())
        );
        (this.commandCache as ConnectableObservable<g2>).connect();
    }
    ngAfterViewInit(): void
    {
        this.renderingCtx = (this.canvasRef.nativeElement as HTMLCanvasElement).getContext('2d');
        this.commandCache.subscribe(this.draw);
    }
    ngOnDestroy(): void
    {
        this.destructionSubject.next();
    }

    draw = (cqueue: g2): void =>
    {
        g2().clr()
            .use({ grp: cqueue })
            .exe(this.renderingCtx);
    }
}
