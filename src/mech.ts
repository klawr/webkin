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
        return formLoop(left, right);
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
            this.points.push(new Mountpoint());
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
                let beta = 0;
                for (let i = 1; i < this.length.length; ++i)
                {
                    const a = this.points[i-1].length;
                    const b = this.length[i];
                    const gamma = this.relAngles[i-1] - gammaOffset;

                    const c = Math.sqrt(a * a + b * b - Math.cos(gamma) * 2 * a * b);
                    beta += Math.asin(Math.sin(gamma) * b / c);
                    const alpha = Math.sin(Math.sin(gamma) * a / c);

                    gammaOffset = alpha;
                    this.points.push(new Mountpoint(c, beta));
                }
            }
        }
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

export interface Loop extends Array<Variable>
{
}

function formLoop(left: Variable[], right?: Variable[]): Loop
{
    return [...left, ...right.map((e) => e.invert())]
}
