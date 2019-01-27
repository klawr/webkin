
export const $index = Symbol('dictionary index');

export interface DictionaryLike<T>
{
    readonly [key: string]: T;

    readonly [$index]?: ReadonlyArray<string>;
}

export interface Dictionary<T> extends DictionaryLike<T>
{
    readonly [$index]: ReadonlyArray<string>;
    readonly [Symbol.iterator]: () => IterableIterator<T>;
}

function xcreate()
{
    const self = Object.create(null);
    self[Symbol.iterator] = function*()
    {
        for (const k of this[$index])
        {
            yield this[k];
        }
    };
    return self;
}

export function create<T>(...data: DictionaryLike<T>[]): Dictionary<T>
{
    const self = xcreate();

    const ilimit = data.length;
    if (ilimit === 0)
    {
        self[$index] = Object.freeze([]);
    }
    else
    {
        const idx = new Set<string>();
        for (let i = 0; i < ilimit; ++i)
        {
            const shard = data[i];
            if ($index in shard)
            {
                const shardIndex = shard[$index];
                shardIndex.forEach(k => idx.add(k));
                const jlimit = shardIndex.length;
                for (let j = 0; j < jlimit; ++j)
                {
                    const k = shardIndex[j];
                    self[k] = shard[k];
                }
            }
            else
            {
                Object.keys(shard).forEach(k => idx.add(k));
                Object.assign(self, shard);
            }
        }
        self[$index] = Object.freeze([...idx].filter(k => {
            if (self[k] === undefined)
            {
                delete self[k];
                return false;
            }
            return true
        }));
    }

    return Object.freeze(self);
}

export function add<T>(dict: Dictionary<T>, k: string, v: T)
{
    const self = Object.assign(Object.create(null), dict);
    const idx = self[$index] = [...dict[$index]];
    self[k] = v;
    if (!(k in dict))
    {
        idx.push(k);
    }
    Object.freeze(idx);
    return Object.freeze(self);
}

export function remove<T>(dict: Dictionary<T>, ...ks: string[])
{
    const self = Object.assign(Object.create(null), dict);
    ks.forEach(k => delete self[k]);
    const idx = self[$index] = dict[$index].filter(k => (k in self));
    Object.freeze(idx);
    return Object.freeze(self);
}

export function keys<T>(dict: Dictionary<T>)
{
    return dict[$index];
}
export function elems<T>(dict: Dictionary<T>)
{
    return dict[$index].map(k => dict[k]);
}

export function map<T, R>(dict: Dictionary<T>, proj: (v: T, k: string, d: Dictionary<T>) => R): Dictionary<R>
{
    const self = xcreate();
    const idx = self[$index] = dict[$index];
    for (let i = 0; i < idx.length; ++i)
    {
        const k = idx[i];
        self[k] = proj(dict[k], k, dict);
    }
    return Object.freeze(self);
}

export function forEach<T, R>(dict: Dictionary<T>, f: (v: T, k: string, d: Dictionary<T>) => R)
{
    dict[$index].forEach((k) => f(dict[k], k, dict));
}
