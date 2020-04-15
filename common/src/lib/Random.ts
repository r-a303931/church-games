import { take, iterMap } from './iter';
import { v4 } from 'uuid';

/**
 * Allows for using Random numbers
 */
export interface Random {
	/**
	 * Gets a random number between 0 and 1
	 */
	get(): number;
}

/**
 * Uses a pseudo random number generator to implement the Random interface
 */
export class PseudoRandom implements Random {
	public get(): number {
		return Math.random();
	}
}

/**
 * Provides "random" functionality
 *
 * Why? Unit tests, that's why
 */
export class NotRandom implements Random {
	// https://xkcd.com/221/
	// Divided by 6 because there are 6 sides on a die
	public constructor(private num = 4 / 6) {
		if (num >= 1 || num < 0) {
			throw new Error('Cannot have a number greater than 1 or less than 0');
		}
	}

	public get(): number {
		return this.num;
	}
}
export class DontShuffleArrayRandom extends NotRandom {
	private constructor() {
		super(0);
	}
}

/**
 * Provides another psuedo-random number generator, but allows for using a seed
 *
 * Good balance between NotRandom and PseudoRandom
 */
export class SeededRandom implements Random {
	public constructor(private seed: number) {}

	public get(): number {
		const random = Math.sin(this.seed++) * 10000;
		return random - Math.floor(random);
	}
}

/**
 * Gets a random number from [lower, upper)
 *
 * @param random The random number generator
 * @param lower The lower bound of the random number generator
 * @param upper The upper bound
 */
export const getRange = (random: Random = new PseudoRandom()) => (lower: number) => (
	upper: number
) => {
	return random.get() * (upper - lower) + lower;
};

/**
 * Gets a random integer from [lower, upper)
 *
 * @param random The random number generator
 * @param lower The lower bound of the random number generator
 * @param upper The upper bound
 */
export const getInt = (random: Random = new PseudoRandom()) => (lower: number) => (upper: number) =>
	Math.floor(getRange(random)(lower)(upper));

/**
 * Gets a random number from [0, upper)
 *
 * @param random The random number generator
 * @param upper The upper bound
 */
export const getFrom0 = (random: Random = new PseudoRandom()) => (upper: number) =>
	getRange(random)(0)(upper);

/**
 * Gets a random integer from [0, upper)
 *
 * @param random The random number generator
 * @param upper The upper bound
 */
export const getIntFrom0 = (random: Random = new PseudoRandom()) => (upper: number) =>
	getInt(random)(0)(upper);

/**
 * Takes an array and returns a new array with all the elements of the previous array shuffled inside it
 *
 * @param random The random number generator
 * @param arr The array to shuffle
 */
export const shuffleArray = (random: Random = new PseudoRandom()) => <T>(arr: T[]): T[] => {
	const original = [...arr];
	const returnValue: T[] = [];

	const getForRandom = getIntFrom0(random);

	for (let i = arr.length; i > 0; i--) {
		returnValue.push(original.splice(getForRandom(i), 1)[0]);
	}

	return returnValue;
};

/**
 * Produces an iterable generator from the random number generator
 *
 * @param random The random number generator
 */
export const generateNumbers = (random: Random = new PseudoRandom()): Iterable<number> => ({
	*[Symbol.iterator]() {
		while (true) {
			yield random.get();
		}
	},
});

/**
 * Used to allow Random to be used for the v4 of the UUID module
 *
 * @param random The random number generator
 */
export const generate16ByteArray = (random: Random = new PseudoRandom()) => () =>
	take(16)(iterMap((num: number) => Math.floor(256 * num))(generateNumbers(random)));

/**
 * Used to allow Random to be used for the v4 of the UUID module, except everything is explicitly targeting
 * the uuid library
 *
 * @param random The random number generator
 */
export const uuidv4Options = (random: Random = new PseudoRandom()) => ({
	rng: generate16ByteArray(random),
});

/**
 * Shorthand for generating a UUID
 *
 * @param random The random number generator
 */
export const uuid = (random: Random = new PseudoRandom()) => () => v4(uuidv4Options(random));

/**
 * Selects a random element from the array provided and returns it
 *
 * @param random The random number generator
 * @param arr The array to select a random element from
 */
export const selectRandom = (random: Random = new PseudoRandom()) => <T>(arr: T[]): T =>
	arr[getIntFrom0(random)(arr.length)];
