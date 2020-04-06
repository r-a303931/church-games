export type MaybeObj<T> = Some<T> | None<T>;

export interface Some<T> {
	hasValue: true;

	value: T;
}

export interface None<T> {
	hasValue: false;
}

const noneObj: None<any> = { hasValue: false };

export class Maybe {
	public static isSome = <T>(m: MaybeObj<T>): m is Some<T> => m.hasValue;

	public static isNone = <T>(m: MaybeObj<T>): m is None<T> => !m.hasValue;

	public static map = <T, U>(f: (v: T) => U) => (m: MaybeObj<T>): MaybeObj<U> =>
		m.hasValue ? Maybe.some(f(m.value)) : m;

	public static orElse = <T>(defaultValue: T) => (m: MaybeObj<T>): MaybeObj<T> =>
		m.hasValue ? m : Maybe.some(defaultValue);

	public static flatMap = <T, U>(f: (v: T) => MaybeObj<U>) => (m: MaybeObj<T>): MaybeObj<U> =>
		m.hasValue ? f(m.value) : m;

	public static join = <T>(m: MaybeObj<T>): T | null => (m.hasValue ? m.value : null);

	public static filter = <T>(f: (v: T) => boolean) => (m: MaybeObj<T>): MaybeObj<T> =>
		m.hasValue && f(m.value) ? m : noneObj;

	public static filterType = <T, U extends T = T>(f: (v: T) => v is U) => (
		m: MaybeObj<T>
	): MaybeObj<U> => Maybe.filter(f)(m) as MaybeObj<U>;

	public static cata = <T, U>(nf: () => U) => (f: (v: T) => U) => (m: MaybeObj<T>) =>
		m.hasValue ? f(m.value) : nf();

	public static chain = <T, U>(f: (v: T) => U) => (m: MaybeObj<T>) => Maybe.join(Maybe.map(f)(m));

	public static orSome = <T>(val: T) => (m: MaybeObj<T>): T => Maybe.join(Maybe.orElse(val)(m))!;

	public static some = <T>(value: T): MaybeObj<T> => {
		if (value === undefined || value === null) {
			throw new Error('Undefined or null passed to just');
		}
		return { hasValue: true, value };
	};

	public static none = <T>(): MaybeObj<T> => noneObj;

	public static fromValue = <T>(value?: T | undefined | null): MaybeObj<T> =>
		value === undefined || value === null ? noneObj : Maybe.some(value);
}

export const get = <T, K extends keyof T = keyof T>(prop: K) => (obj: T): T[K] => obj[prop];
