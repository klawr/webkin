
"use strict";

import * as math from 'mathjs';

// links are merely sticks with a length. They have to connect to something, otherwise they are not controllable.
export class Link
{
    constructor(
            public readonly r: number,
            public readonly connection: Link|Base,
            public readonly name?: string,
            public w?: () => number) {
    }
}

// bases are a sole point in space. They do not need a connector, they are the connectors.
export class Base
{
    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly connection?: Link|Base) {
    }
}

// a mechanism is a combination of bases and links.
export class Mechanism
{
    readonly loops: Link[][][] = [];
    readonly vars: Link[];
    unknown: number[] = [];
    readonly eq_str = () => {
        const ret: string[] = [];
        this.loops.forEach((loop) => {
            let sin = ['',''];
            let cos = ['',''];
            loop.forEach((side, idx) => {
                const sign = (idx ? ' - ' : ' + ' );
                side.forEach((link) => {
                    sin[+this.vars.includes(link)] += sign + `${link.r} * sin(${link.name})`;
                    cos[+this.vars.includes(link)] += sign + `${link.r} * cos(${link.name})`;
                });
                // cos[0] += (idx ? ' - ' : '') + l.map((e) => `${e.r} * cos(${e.name}${(this.vars.includes(e) ? '?' : '')})`).join(idx ? ' - ' : ' + ');
            });
            ret.push(sin.join(' = '), cos.join(' = '));
        });
        return ret;
    };
    readonly eq = () => {
        const eqs: number[] = [];
        this.loops.forEach((loop) => {
            let sin = 0;
            let cos = 0;
            loop.forEach((link) => {
                link.forEach((l, idx) => {
                    sin += (l.r + Math.sin(l.w())) * (idx ? -1 : 1);
                    cos += (l.r + Math.cos(l.w())) * (idx ? -1 : 1);
                })
            })
            eqs.push(sin, cos);
        })
        return eqs;
    }
    constructor(readonly links: Link[],readonly connections: Link[][])
    {
        // filter for all elements who have no connector
        const heads = links.filter((link) => {
            return !links.some((l) => l.connection === link);
        });
        // generate the tail for each head
        const preloops: Link[][] = [];
        heads.forEach((head) => {
                const end = preloops.push([head]) - 1;
                for (let l = head; l.connection instanceof Link; l = l.connection)
                {
                    preloops[end].unshift(l.connection);
                }
        });
        // identify the unknown values:
        this.vars = links.filter((l) => !l.w);
        this.vars.forEach(() => this.unknown.push(0));
        this.vars.map((v,idx) => {
            v.w = () => this.unknown[idx];
        });
        // closed integral conditions for the mechanism
        connections.forEach((con) => {
            // create a loop for each connection
            const idx = this.loops.push([]) - 1;
            const loop = this.loops[idx];
            // define the positive part of this equation
            preloops.forEach((l) => {
                const c0 = l.indexOf(con[0]) + 1;
                const c1 = l.indexOf(con[1]) + 1;
                if(c0)
                {
                    loop[0] = l.slice(0,c0);
                }
                else if(c1)
                {
                    loop[1] = l.slice(0,c1);
                }
            });
            // get missing Link from Bases
            const dy = (loop[1][0].connection as Base).y - (loop[0][0].connection as Base).y;
            const dx = (loop[1][0].connection as Base).x - (loop[0][0].connection as Base).x;
            loop[1].unshift(
                new Link(
                    Math.hypot(dx,dy),
                    loop[0][0],
                    'bs',
                    () => Math.atan2(dy,dx)
                )
            );
        });
    }
}
