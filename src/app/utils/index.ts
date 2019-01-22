
export function fac<T2 extends object, T3, T4, T5, T6, T7, T8, T9, T1>(
    o1: T2, o2?: T3, o3?: T4, o4?: T5, o5?: T6, o6?: T7, o7?: T8, o8?: T9, o9?: T1
 ): Readonly<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9>
 {
     return Object.freeze(Object.assign(Object.create(null), o1, o2, o3, o4, o5, o6, o7, o8, o9));
 }
 export function fdac<T1 extends object, T2, T3, T4, T5, T6, T7, T8, T9>(
     prop: string | number, o1: T2, o2?: T3, o3?: T4, o4?: T5, o5?: T6, o6?: T7, o7?: T8, o8?: T9, o9?: T1
 ): Readonly<T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9>
 {
     const n = Object.assign(Object.create(null), o1, o2, o3, o4, o5, o6, o7, o8, o9);
     delete n[prop];
     return Object.freeze(n);
 }
