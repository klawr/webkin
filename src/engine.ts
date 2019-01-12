
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

    get isDefined() { return !!this.absAngle; }

    invert()
    {
        const nlen = this.length && -this.length
        return new Variable(this.id, this.angleOffset, this.absAngle, nlen);
    }
}

export class Loop extends Array<Variable> {
    constructor(left: Variable[], right: Variable[])
    {
        super(...left, ...right.map(e => e.invert()));
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
    vars: Loop[];

    constructor(public loops: Loop[]) {
        this.vars = loops.map((loop) => {
            loop.filter((vars) => {
                !(vars.absAngle === undefined || vars.length === undefined)
            })
        }).flat();

        // calculation is something like this:
        this.q_i = this.vars.map((val) => Math.random());
        this.Phi = new LoopVector(loops);
        const jacobi: Matrix = this.Phi.jacobi();
        const inv_jacobi = jacobi.inv();
        this.q_i = inv_jacobi.times_a_vector(this.Phi);
    }
}
