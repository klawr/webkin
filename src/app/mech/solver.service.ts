import { Loop, Variable } from "./mech.service";


function nearlyEqual(a:number, b:number, epsilon:number): boolean
{
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    const diff = Math.abs(a - b);

    if (a === b)
    { // shortcut, handles infinities
        return true;
    }
    if (a === 0 || b === 0 || diff < Number.EPSILON)
    {
        // a or b is zero or both are extremely close to it
        // relative error is less meaningful here
        return diff < (epsilon * Number.EPSILON);
    }
    // use relative error
    return diff / (absA + absB) < epsilon;
}

class Matrix extends Array<number[]> {
    constructor(content: number[][] | number) {
        if (typeof content === 'number')
        {
            super(content);
        }
        else
        {
            super(...content);
            for (let i = 0; i < this.length; ++i)
            {
                this[i] = this[i].slice();
            }
        }
    }

    static generate(n: number, g: (i: number, j: number, data: number[][]) => number)
    {
        const A = new Matrix(n);
        for (let i = 0; i < n; ++i)
        {
            const row = A[i] = new Array<number>(n);
            for (let j = 0; j < n; ++j)
            {
                row[j] = g(i, j, A);
            }
        }
        return A;
    }

    static generateReverse(n: number, g: (i: number, j: number, data: number[][]) => number)
    {
        const A = new Matrix(n);
        for (let i = n - 1; i >= 0; --i)
        {
            const row = A[i] = new Array<number>(n);
            A.unshift(row);
            for (let j = n - 1; j >= 0; --j)
            {
                row[j] = g(i, j, A);
            }
        }
        return A;
    }

    static identity(n: number)
    {
        return this.generate(n, (i, j) => +(i === j));
    }

    xy(b: number[]): number[]
    {
        const {L,R,P} = this.lr();

        function generate(n: number, g: (i: number, data: number[]) => number)
        {
            const val: number[] = [];
            for (let i = 0; i < n; ++i)
            {
                val.push(g(i, val));
            }
            return val;
        }
        function generateReverse(n: number, g: (i: number, data: number[]) => number)
        {
            const val: number[] = [];
            for (let i = n - 1; i >= 0; --i)
            {
                val.unshift(g(i, val));
            }
            return val;
        }
        function mult(A: Matrix, b: number[])
        {
            return generate(A.length, (i) =>
                A[i].reduce((acc, v_ik, k) => acc + v_ik * b[k], 0)
            );
        }

        b = mult(P, b);

        const y = generate(this.length, (i, data) => {
            let acc = b[i];
            for (let k = 0; k < i; ++k)
            {
                acc -= L[i][k] * data[k];
            }
            return acc / L[i][i];
        });

        const x = generateReverse(this.length, (i, data) => {
            let acc = y[i];
            for (let k = 1; k < data.length; ++k)
            {
                acc -= R[i][k+i] * data[k];
            }
            return - (acc / R[i][i]);
        });

        return x;
    }

    mult(X: Matrix)
    {
        if (X.length !== this.length)
        {
            throw Error("not implemented");
        }
        return Matrix.generate(this.length, (i, j) =>
            this[i].reduce((acc, v_ik, k) => acc + v_ik * X[k][j], 0)
        );
    }

    transpose()
    {
        const cpy = new Matrix(this);
        cpy.forEach(l => l.reverse());
        cpy.reverse();
        return cpy;
    }

    invDet(): Matrix
    {
        const det = this.det();
        return new Matrix(this.adj().map((row) => row.map((col) => col / det)));
    }
    invLR(): Matrix
    {
        const {L,R,P} = this.lr();

        const Y = Matrix.generate(this.length, (i, j, data) => {
            let acc = P[i][j];
            for (let k = 0; k < i; ++k)
            {
                acc -= L[i][k] * data[k][j];
            }
            return acc / L[i][i];
        });

        const X = Matrix.generateReverse(this.length, (i ,j , data) => {
            let acc = Y[i][j];
            for (let k = 1; k < data.length; ++k)
            {
                acc -= R[i][k+i] * data[k][j];
            }
            return acc / R[i][i];
        });

        return X;
    }
    lr(): { L: Matrix, R: Matrix, P: Matrix }
    {
        const I = Matrix.identity(this.length);

        const CX = this.slice();
        const L = Matrix.generate(this.length, () => 0);
        const R = new Matrix(this);
        const P: Matrix[] = [];
        for (let j = 0; j < this.length; ++j)
        {
            let jmax = j;
            for (let i = j+1; i < this.length; ++i)
            {
                if (Math.abs(CX[i][j]) > Math.abs(CX[jmax][j]))
                {
                    jmax = i;
                }
            }

            const P_j = new Matrix(I);
            P_j[j] = I[jmax];
            P_j[jmax] = I[j];
            P.unshift(P_j);

            let tmp = L[j];
            L[j] = L[jmax];
            L[jmax] = tmp;
            L[j][j] = 1;

            tmp = R[j];
            R[j] = R[jmax];
            R[jmax] = tmp;

            tmp = CX[j]
            CX[j] = CX[jmax];
            CX[jmax] = tmp;

            for (let i = j + 1; i < this.length; ++i)
            {
                L[i][j] = R[i][j] / R[j][j];
                for (let k = j; k < this.length; ++k)
                {
                    R[i][k] = R[i][k] - L[i][j] * R[j][k];
                }
            }
        }

        return {L,R, P: P.reduce((m1, m2) => m1.mult(m2)) };
    };

    private det(): number
    {
        const len = this.length;
        let sum = 0;
        for (let i = 0; i < len; ++i) {
            let prod = 1;
            for (let j = 0; j < len; ++j) {
                prod *= this[j][(i+j)%len];
            }
            sum += prod;
        }
        for (let i = len - 1; i >= 0; --i) {
            let prod = 1;
            for (let j = 0; j < len; ++j) {
                prod *= this[j][(len+i-j)%len]
            }
            sum -= prod;
        }
        return sum;
    };
    private adj(): Matrix
    {
        const len = this.length;
        const adj = new Array(len).fill(0).map(() => [] as number[]);
        for (let i = 0; i < len; ++i) {
            for (let j = 0; j < len; ++j) {
                adj[j][i] = this.minor(i,j).det() * ((i+j) % 2 ? 1 : -1);
            }
        }
        return new Matrix(adj);
    };

    private minor(i: number,j: number): Matrix
    {
        let minor = this.map(r => r.slice());
        minor.splice(i, 1)
        minor.forEach((col) => col.splice(j,1));
        return new Matrix(minor);
    }

    equals(other: Matrix, epsilon: number)
    {
        return this.every((l, i) =>
            l.every((c, j) =>
                nearlyEqual(c, other[i][j], epsilon)
            )
        );
    }
}

export type LinSolve = (jacobi: Matrix, q_i: number[]) => number[];

export function solver(d: LinSolve, loops: Loop[])
{
    const vars = new Set<string>(
        loops.flatMap(loop => loop.filter(v => v.isUndefined).map(v => v.id))
    );

    function solvePhi(loops: Loop[], q: Map<string, number>): number[]
    {
        const accessOrResolve = (id: string, value?: number) => value === undefined ? q.get(id) : value;

        return loops.flatMap((row) =>
            row.map((link) => [ accessOrResolve(link.id, link.length), accessOrResolve(link.id, link.absAngle) + link.angleOffset ])
               .map((cell) => [ cell[0] * Math.cos(cell[1]), cell[0] * Math.sin(cell[1]) ])
               .reduce((l, r) => [ l[0] + r[0], l[1] + r[1] ]));
    }
    function jacobi(loops: Loop[], q: Map<string, number>): Matrix
    {
        return new Matrix(loops.flatMap((row) => {
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

    const rnd = () => [...vars].reduce((o, v) => ({ ...o, [v]: { q: Math.random() * Math.PI * 2 } }), Object.create(null) as SolveResult);
    return function* solve(s: [string, number], q_in: SolveResult = rnd())
    {
        const _loops = loops.slice().map(loop => loop.map(v => {
            if (v.id !== s[0])
            {
                return v;
            }
            const angle = v.absAngle !== undefined ? v.absAngle : s[1];
            const length = v.length !== undefined ? v.length : s[1];
            return new Variable(v.id, v.angleOffset, angle, length);
        }));

        let q_i = new Map(
            Object.getOwnPropertyNames(q_in)
                  .filter(n => n !== s[0])
                  .map(n => [n, q_in[n].q] as [string, number])
        );

        let q_r: SolveResult;
        let J: Matrix;
        let dq: number[];
        do
        {
            const phi = solvePhi(_loops, q_i);
            J = jacobi(_loops, q_i);
            dq = d(J, phi);

            q_i = new Map([...q_i].map((val, idx) => {
                return [val[0], val[1] + dq[idx]] as [string, number]
            }));
            q_r = pack([...q_i, s]);
        }
        while (!(yield q_r) && dq.some((v) => Math.abs(v) > 1e-3));

        let q_i_ = [...q_i, s];
        const v = speed(_loops, J, s[0]);
        q_r = pack(q_i_, v);
        const a = accel(_loops, J, q_r);
        q_r = pack(q_i_, v, a);
        yield q_r;
    }
}

function speed(loops: Loop[], J: Matrix, s: string)
{
    const phi_ = loops.flatMap(l => l.filter(v => v.id === s)
        .map(v => {
            const angle = v.absAngle + v.angleOffset;
            return [ v.length * Math.sin(angle), -v.length * Math.cos(angle) ];
        })
        .reduce((l, r) => [ l[0] + r[0], l[1] + r[1] ], [0, 0])
    );
    return J.xy(phi_).concat(1);
}

function accel(loops: Loop[], J: Matrix, q_r: SolveResult): number[]
{
    const accessOrResolve = (id: string, value?: number) =>
        value === undefined ? q_r[id].q : value;

    const phi__ = loops.flatMap((row) =>
        row.map((link) => [
            accessOrResolve(link.id, link.length),
            accessOrResolve(link.id, link.absAngle) + link.angleOffset,
            q_r[link.id] ? q_r[link.id].v : 0
        ]).map((cell) => [
            cell[0] * Math.cos(cell[1]) * cell[2] * cell[2],
            cell[0] * Math.sin(cell[1]) * cell[2] * cell[2]
        ]).reduce((l, r) => [ l[0] + r[0], l[1] + r[1] ], [0, 0]));

    return J.xy(phi__).concat(0);
}

export interface SolveResult
{
    [linkName: string]: {
        q: number,
        v?: number,
        a?: number,
    };
}

function pack(q_i: [string, number][], speed?: number[], accel?: number[]): SolveResult
{
    return q_i.reduce((o, v, i) => ({
        ...o, [v[0]]: {
            q: v[1],
            v: speed && speed[i],
            a: accel && accel[i] }
        }), Object.create(null) as SolveResult);
}

export function lrSolver(loops: Loop[])
{
    const impl: LinSolve = (jacobi, phi) => jacobi.invLR()
        .map((col) =>
            col.reduce((acc, cur, idx) => acc -(cur * phi[idx]), 0)
    );

    return solver(impl, loops);
}

export function detSolver(loops: Loop[])
{
    const impl: LinSolve = (jacobi, Phi) => jacobi.invDet()
        .map((col) =>
            col.reduce((acc, cur, idx) => acc -(cur * Phi[idx]), 0)
    );

    return solver(impl, loops);
}

export function xySolver(loops: Loop[])
{
    const impl: LinSolve = (jacobi, Phi) => jacobi.xy(Phi);
    return solver(impl, loops);
}
