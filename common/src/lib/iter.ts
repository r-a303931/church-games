export const matchByProp = <T, K extends keyof T = keyof T>(prop: K) => (value1: T) => (
	value2: T
) => value1[prop] === value2[prop];

export const matchByName = matchByProp<{ name: string }>('name');

export const iterMap = <T, U>(map: (v: T) => U) =>
	function* (iter: Iterable<T>) {
		for (const i of iter) {
			yield map(i);
		}
	};

export const take = (howMany: number) => <T>(iter: Iterable<T>): T[] => {
	const returnValue: T[] = [];

	for (const value of iter) {
		if (returnValue.length >= howMany) {
			return returnValue;
		}

		returnValue.push(value);
	}

	return returnValue;
};

export const iterFilter = <T, S extends T>(filter: (v: T) => v is S) =>
	function* (iter: Iterable<T>) {
		for (const i of iter) {
			if (filter(i)) {
				yield i;
			}
		}
	};

export const iterReduce = <T, U>(reducer: (prev: U, curr: T) => U) => (initialValue: U) => (
	iter: Iterable<T>
) => {
	let value = initialValue;

	for (const i of iter) {
		value = reducer(value, i);
	}

	return value;
};

export const iterFind = <T, S extends T>(predicate: (v: T) => v is S) => (
	iter: Iterable<T>
): S | undefined => {
	for (const i of iter) {
		if (predicate(i)) {
			return i;
		}
	}
};

export const iterIncludes = <T>(value: T) => (iter: Iterable<T>) => {
	for (const i of iter) {
		if (value === i) {
			return true;
		}
	}

	return false;
};
