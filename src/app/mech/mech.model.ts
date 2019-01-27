import * as dict from '../utils/dictionary';

export interface JointId
{
    readonly linkId: string;
    readonly mountId: number;
}

export interface Mountpoint
{
    readonly length?: number;
    readonly angleOffset: number;
}

export interface Link
{
    readonly id: string;
    readonly joint?: JointId;
    readonly points: Mountpoint[];
    readonly absAngle?: number;
    readonly edgeLengths: number[];
    readonly relAngles: number[];
}

export class Variable
{
    constructor(
        public readonly id: string,
        public readonly angleOffset: number,
        public readonly absAngle?: number,
        public readonly length?: number
    ) {
        Object.freeze(this);
    }

    get isUndefined() { return this.absAngle === undefined || this.length === undefined; }

    invert()
    {
        const nlen = this.length && -this.length
        return new Variable(this.id, this.angleOffset, this.absAngle, nlen);
    }
}

export interface LoopDefinition
{
    readonly left: JointId;
    readonly right: JointId;
}

export interface Loop extends Array<Variable>
{
}

export interface LinkInfo
{
    readonly q: number;
    readonly v?: number;
    readonly a?: number;
    readonly points?: LinkPointInfo;
}

export type LinkPointInfo = ReadonlyArray<MechPointInfo>;

export interface MechPointInfo
{
    readonly coordinates: Vector2;
    readonly velocity: Vector2;
    readonly acceleration: Vector2;
}

export interface Vector2
{
    readonly x: number;
    readonly y: number;
};

export type SolveResult = dict.Dictionary<LinkInfo>;

export type SolveResults = SolveResult[];
