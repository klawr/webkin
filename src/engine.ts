
type JointId = [string, number];

export class Mechanism
{
    readonly links = new Map<string, Link>();

    constructor() {}
    defineLink(id: string, params: {
        length?: number[] | number,
        relAngles?: number[],
        absAngle?: number,
        joint?: string | JointId } = {}): Mechanism
    {
        let l = new Link(id, params.joint, params.length, params.relAngles, params.absAngle);
        this.links.set(id, l);
        return this;
    }

    extractLoop(leftId: JointId, rightId: JointId)
    {
        const left = this.buildChain(leftId);
        const right = this.buildChain(rightId);

        return new Loop(left, right);
    }

    private buildChain(id: JointId)
    {
        let e = this.links.get(id[0]);
        let mp = e.points[id[1]];
        const s = [new Variable(id[0], mp.angleOffset, e.absAngle, mp.length)];
        while (id = e.joint)
        {
            e = this.links.get(id[0]);
            mp = e.points[id[1]];
            s.unshift(new Variable(id[0], mp.angleOffset, e.absAngle, mp.length));
        }
        return s;
    }
}

export class Mountpoint
{
    constructor(
        public readonly length?: number,
        public readonly angleOffset: number = 0
    ) {
    }
}

export class Link
{
    public readonly joint?: JointId;
    public readonly points = [] as Mountpoint[];
    public readonly length: number[];
    public readonly relAngles: number[];

    constructor(
        public readonly id: string,
        joint?: string | JointId,
        length?: number[] | number,
        relAngles?: number[],
        public readonly absAngle?: number
    ) {
        if (typeof joint === 'undefined')
        {
            this.joint = undefined;
        }
        else if (typeof joint === 'string')
        {
            this.joint = [ joint, 0 ];
        }
        else
        {
            this.joint = joint.slice() as JointId;
        }

        if (typeof length === 'undefined')
        {
            this.length = [];
        }
        else
        {
            if (typeof length === 'number')
            {
                this.length = [ length ];
            }
            else
            {
                this.length = length.slice();
            }
            this.relAngles = typeof relAngles === 'object' ? relAngles.slice() : [];
            if (this.length.length)
            {
                if (this.relAngles.length !== this.length.length - 1)
                {
                    throw new Error("angles.length !== length.length - 1");
                }
                this.points.push(new Mountpoint(this.length[0]));
                let gammaOffset = 0;
                for (let i = 1; i < this.length.length; ++i)
                {
                    const a = this.points[i-1].length;
                    const b = this.length[i];
                    const gamma = this.relAngles[i-1] - gammaOffset;

                    const c = Math.sqrt(a * a + b * b + Math.sin(gamma) * 2 * a * b);
                    const beta = Math.sin(gamma) * b / c;
                    const alpha = Math.sin(gamma) * a / c;

                    gammaOffset = alpha;
                    this.points.push(new Mountpoint(c, beta));
                }
            }
        }
    }
}

export class Variable
{
    constructor(
        public readonly id: string,
        public readonly angleOffset: number,
        public readonly absAngle?: number,
        public readonly length?: number
    ) {
    }

    get isUndefined() { return this.absAngle === undefined || this.length === undefined; }

    invert()
    {
        const nlen = this.length && -this.length
        return new Variable(this.id, this.angleOffset, this.absAngle, nlen);
    }
}

export class Loop extends Array<Variable> {
    constructor(left: Variable[], right: Variable[])
    {
        super(...left, ...right.map((e) => e.invert()));
    }
}

class Matrix extends Array<Array<number>> {
    constructor(public readonly val: number[][]) {
        super();
    }
    inv(): Matrix
    {
        return new Matrix(this.adj().map((row) => row.map((col) => col / this.det())));
    };
    private det(): number
    {
        const len = this.val.length;
        let sum = 0;
        for (let i = 0; i < len; ++i) {
            let prod = 1;
            for (let j = 0; j < len; ++j) {
                prod *= this.val[j][(i+j)%len];
            }
            sum += prod;
        }
        for (let i = len - 1; i >= 0; --i) {
            let prod = 1;
            for (let j = 0; j < len; ++j) {
                prod *= this.val[j][(len+i-j)%len]
            }
            sum -= prod;
        }
        return sum;
    };
    private adj(): Matrix
    {
        const len = this.val.length;
        const adj = [] as number[][];
        for (let i = 0; i < len; ++i) {
            for (let j = 0; i < len; ++j) {
                adj[j][i] = this.minor(i,j).det() * (i+j) % 2 ? 1 : -1;
            }
        }
        return new Matrix(adj);
    };

    private minor(i: number,j: number): Matrix
    {
        let minor = this.val.slice();
        minor.splice(i, 1)
        minor.forEach((col) => col.splice(j,1));
        return new Matrix(minor);
    }
}

export class Solver {
    vars: Set<string>;

    constructor(public readonly loops: Loop[])
    {
        this.vars = new Set<string>();
        loops.forEach((loop) => {
            loop.forEach((v) => {
                if (v.isUndefined) {
                    this.vars.add(v.id);
                }
            })
        });
    }

    solve = function* solve(): IterableIterator<Map<string, number>>
    {
        let q_i = new Map([...this.vars].map((v) => [v, Math.random()] as [string, number]));
        const Phi = this.solvePhi(q_i) as number[];
        const jacobi = this.jacobi(q_i).inv() as Matrix;

        while (true)
        {
            const dq: number[] = jacobi.map((col) => {
                return col.reduce((acc, cur, idx) => {
                    return acc += cur * Phi[idx];
                });
            });
            q_i = new Map([...q_i].map((val, idx) => {
                return [val[0], val[1] + dq[idx]] as [string, number]
            }));
            yield q_i;
        }
    }

    solvePhi(q: Map<string, number>): number[]
    {
        const accessOrResolve = (id: string, value?: number) => value === undefined ? q.get(id) : value;

        return this.loops.flatMap((row) =>
            row.map((link) => [ accessOrResolve(link.id, link.length), accessOrResolve(link.id, link.absAngle) + link.angleOffset ])
               .map((cell) => [ cell[0] * Math.cos(cell[1]), cell[0] * Math.sin(cell[1]) ])
               .reduce((l, r) => [ l[0] + r[0], l[1] + r[1] ]));
    }
    jacobi(q: Map<string, number>): Matrix
    {
        return new Matrix(this.loops.flatMap((row) => {
            const q_ = [...q].map((qj) => ({ id: qj[0], value: qj[1] }));
            const ex = [] as number[];
            const ey = [] as number[];
            q_.forEach((qj) => {
                const v = row.find((vi) => vi.id === qj.id);
                if (v)
                {
                    if (v.absAngle === undefined)
                    {
                        ex.push(-v.length * Math.sin(qj.value + v.angleOffset));
                        ey.push(+v.length * Math.cos(qj.value + v.angleOffset));
                    } else {
                        ex.push(Math.cos(v.absAngle + v.angleOffset));
                        ey.push(Math.sin(v.absAngle + v.angleOffset));
                    }
                }
                else
                {
                    ex.push(0);
                    ey.push(0);
                }
            })
            return [ex, ey];
        }));
    }
    dq: () => number[];
}
