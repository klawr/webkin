
const tau = 2* Math.PI; // just because

export class Value
{
    constructor(
        readonly val: (...args: Link[]) => number,
        readonly argIds: string[] = []
    ) {
    }
}

export class Mechanism
{
    readonly links = new Map<string, Link>();

    constructor() {}
    defineLink(id: string, params: { length?: Value, angle?: Value, parentId?: string } = {}): Link
    {
        let l = new Link(id, params.parentId, params.length, params.angle);
        this.links.set(id, l);
        return l;
    }

    extractLoop(leftId: string, rightId: string)
    {
        const left = this.buildChain(leftId);
        const right = this.buildChain(rightId);

        return new Loop(left, right);
    }

    private buildChain(id: string)
    {
        let e = this.links.get(id);
        const ch = [e];
        while (e.parentId)
        {
            ch.unshift(e);
        }
        return ch;
    }
}

export class XLINK
{
    rlink: Link[]

    constructor(
        public readonly id: string,
        public readonly length: Value[],
        public readonly angle: Value[],
        public readonly parentId?: string
    ) {
        /* ... */
    }
}
export class Link
{
    constructor(
        public readonly id: string,
        public readonly parentId?: string,
        public readonly length?: Value,
        public readonly angle?: Value
    ) {
    }

    invert(): Link
    {
        return new Link(this.id, this.parentId,
            this.length
                ? new Value((...args: Link[]) => -this.length.val(...args), this.length.argIds.slice())
                : undefined,
            this.angle
        );
    }
}

export class Loop extends Array<Link> {
    constructor(left: Link[], right: Link[])
    {
        super(...left, ...right.map(l => l.invert()));
    }
}

class LoopVector {
    q: number[];
    calc: () => number[];
    jacobi: () => Matrix;
    dq: () => number[];
    constructor(public readonly vector: Loop[]) {}
}

class Matrix {
    constructor(public readonly vector: Loop[]) {}
    // Calculate...
    // ...inverse Matrix
    inv: () => Matrix;
    // ...determinant
    private det: () => number;
    // ... adjugate Matrix
    private adj: () => Matrix;

    times_a_vector: (vector: LoopVector) => number[];
}

export class Solver {
    q_i: number[] = [];
    Phi: LoopVector;


    constructor(public loops: Loop[]) {
        const vars = loops.map((loop) => {
            loop.filter((link) => {
                !(link.angle || link.length)
            })
        }).flat();

        // calculation is something like this:
        this.q_i = vars.map((val) => Math.random());
        this.Phi = new LoopVector(loops);
        const jacobi: Matrix = this.Phi.jacobi();
        const inv_jacobi = jacobi.inv();
        this.q_i = inv_jacobi.times_a_vector(this.Phi);
    }
}
