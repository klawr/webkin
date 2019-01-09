
import * as math from 'mathjs';
import { stringify } from 'querystring';

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
    readonly eqs: string[];
    readonly evaqs: number[] = [];
    readonly jacobi: string[][] = [];
    readonly evacobi: number[][] = [];
    readonly q: math.MathType;
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
        this.vars.forEach(() => this.unknown.push(1));
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
        // prepare the equation system for the jacobi matrix
        // @ts-ignore
        [this.eqs, this.evaqs] = (() => {
            const ret: string[] = [];
            const retv: number[] = [];
            this.loops.forEach((loop) => {
                let sin = ''
                let cos = '';
                let sinv = 0;
                let cosv = 0;
                loop.forEach((side, idx) => {
                    const sign = (idx ? ' - ' : ' + ' );
                    const signv = (idx ? -1 : 1);
                    side.forEach((link) => {
                        sin += sign + `${link.r} * sin(${link.name})`;
                        cos += sign + `${link.r} * cos(${link.name})`;
                        sinv += link.r * Math.sin(link.w()) * signv;
                        cosv += link.r * Math.cos(link.w()) * signv;
                    });
                });
                ret.push(sin, cos);
                retv.push(sinv, cosv);
            });
            return [ret, retv];
        })();
        // create the jacobi matrix
        this.eqs.forEach((eq,idx) => {
            this.jacobi.push([]);
            this.vars.forEach((v) => {
                this.jacobi[idx].push(
                    math.derivative(eq, v.name)
                        .toString()
                        .replace(v.name, v.w().toString())
                );
            })
        });
        this.jacobi.forEach((col,idx) => {
            this.evacobi.push([]);
            col.forEach((row) => {
                this.evacobi[idx].push(math.eval(row));
            });
        });
      //  this.eqs.forEach((eq) => this.evaqs.push(math.eval(eq)));
        this.q = math.multiply(math.inv(this.evacobi), this.evaqs);
    }
}
