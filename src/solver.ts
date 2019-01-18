import { Loop } from "./mech";


function nearlyEqual(a:number, b:number, epsilon:number): boolean
{
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    const diff = Math.abs(a - b);

    if (a == b)
    { // shortcut, handles infinities
        return true;
    }
    if (a == 0 || b == 0 || diff < Number.EPSILON)
    {
        // a or b is zero or both are extremely close to it
        // relative error is less meaningful here
        return diff < (epsilon * Number.EPSILON);
    }
    // use relative error
    return diff / (absA + absB) < epsilon;
}

class Matrix {
    constructor(public readonly val: number[][]) {
    }

    get length() { return this.val.length; }

    static generate(n: number, g: (i: number, j: number, data: number[][]) => number)
    {
        const val: number[][] = [];
        for (let i = 0; i < n; ++i)
        {
            const z: number[] = [];
            val.push(z);
            for (let j = 0; j < n; ++j)
            {
                z.push(g(i, j, val));
            }
        }
        return new Matrix(val);
    }

    static generateReverse(n: number, g: (i: number, j: number, data: number[][]) => number)
    {
        const val: number[][] = [];
        for (let i = n - 1; i >= 0; --i)
        {
            const z: number[] = [];
            val.unshift(z);
            for (let j = n - 1; j >= 0; --j)
            {
                z.unshift(g(i, j, val));
            }
        }
        return new Matrix(val);
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
                A.val[i].reduce((acc, v_ik, k) => acc + v_ik * b[k], 0)
            );
        }

        b = mult(P, b);

        const y = generate(this.length, (i, data) => {
            let acc = b[i];
            for (let k = 0; k < i; ++k)
            {
                acc -= L.val[i][k] * data[k];
            }
            return acc / L.val[i][i];
        });

        const x = generateReverse(this.length, (i, data) => {
            let acc = y[i];
            for (let k = 1; k < data.length; ++k)
            {
                acc -= R.val[i][k+i] * data[k];
            }
            return - (acc / R.val[i][i]);
        });

        return x;
    }

    copy()
    {
        return new Matrix(this.val.map(e => e.slice()));
    }

    mult(X: Matrix)
    {
        if (X.length !== this.length)
        {
            throw Error("not implemented");
        }
        return Matrix.generate(this.length, (i, j) =>
            this.val[i].reduce((acc, v_ik, k) => acc + v_ik * X.val[k][j], 0)
        );
    }

    transpose()
    {
        return new Matrix(this.val.map(x => x.slice().reverse()).reverse());
    }

    invDet(): Matrix
    {
        const det = this.det();
        return new Matrix(this.adj().val.map((row) => row.map((col) => col / det)));
    }
    invLR(): Matrix
    {
        const {L,R,P} = this.lr();

        const Y = Matrix.generate(this.length, (i, j, data) => {
            let acc = P.val[i][j];
            for (let k = 0; k < i; ++k)
            {
                acc -= L.val[i][k] * data[k][j];
            }
            return acc / L.val[i][i];
        });

        const X = Matrix.generateReverse(this.length, (i ,j , data) => {
            let acc = Y.val[i][j];
            for (let k = 1; k < data.length; ++k)
            {
                acc -= R.val[i][k+i] * data[k][j];
            }
            return acc / R.val[i][i];
        });

        return X;
    }
    lr(): { L: Matrix, R: Matrix, P: Matrix }
    {
        const I = Matrix.identity(this.length);

        const CX = this.val.slice();
        const L = Matrix.generate(this.length, () => 0);
        const R = this.copy();
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

            const P_j = I.copy();
            P_j.val[j] = I.val[jmax];
            P_j.val[jmax] = I.val[j];
            P.unshift(P_j);

            let tmp = L.val[j];
            L.val[j] = L.val[jmax];
            L.val[jmax] = tmp;
            L.val[j][j] = 1;

            tmp = R.val[j];
            R.val[j] = R.val[jmax];
            R.val[jmax] = tmp;

            tmp = CX[j]
            CX[j] = CX[jmax];
            CX[jmax] = tmp;

            for (let i = j + 1; i < this.length; ++i)
            {
                L.val[i][j] = R.val[i][j] / R.val[j][j];
                for (let k = j; k < this.length; ++k)
                {
                    R.val[i][k] = R.val[i][k] - L.val[i][j] * R.val[j][k];
                }
            }
        }

        return {L,R, P: P.reduce((m1, m2) => m1.mult(m2)) };
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
        let minor = this.val.map(r => r.slice());
        minor.splice(i, 1)
        minor.forEach((col) => col.splice(j,1));
        return new Matrix(minor);
    }

    equals(other: Matrix, epsilon: number)
    {
        return this.val.every((l, i) =>
            l.every((c, j) =>
                nearlyEqual(c, other.val[i][j], epsilon)
            )
        );
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
            });
        });
    }

    solve = function* solve(): IterableIterator<Map<string, number>>
    {
        const rnd = () => new Map([...this.vars].map((v) => [v, Math.random()] as [string, number]));
        let q_i = rnd();

        let i = 0;
        while (true)
        {
            const Phi = this.solvePhi(q_i);

            const mode: number = 0;
            let jacobi: Matrix;
            let dq: number[] ;
            switch (mode) {
                case 0:
                    jacobi = this.jacobi(q_i).invLR();
                    dq = jacobi.val.map((col) => {
                        return col.reduce((acc, cur, idx) => acc -(cur * Phi[idx]), 0);
                     });
                    break;
                case 1:
                    jacobi = this.jacobi(q_i).invDet();
                    dq = jacobi.val.map((col) => {
                        return col.reduce((acc, cur, idx) => acc -(cur * Phi[idx]), 0);
                     });
                    break;
                default:
                    jacobi = this.jacobi(q_i);
                    dq = jacobi.xy(Phi);
                    break;
            }

            q_i = new Map([...q_i].map((val, idx) => {
                return [val[0], val[1] + dq[idx]] as [string, number]
            }));
            if (i % 100 === 99)
            {
                console.log(`reroll after ${i} attempts`);
                q_i = rnd();
            }
            else if (dq.every((v) => Math.abs(v) < 1e-3) || i > 1000)
            {
                console.log(`finish after ${i} attempts`);
                return q_i;
            }
            yield q_i;
            ++i;
        }
    }

    solvePhi(q: Map<string, number>): number[]
    {
        const accessOrResolve = (id: string, value?: number) => value === undefined ? q.get(id) : value;

        return this.loops.flatMap((row) =>
       [...row].map((link) => [ accessOrResolve(link.id, link.length), accessOrResolve(link.id, link.absAngle) + link.angleOffset ])
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
