import {
	Random,
	NotRandom,
	SeededRandom,
	getRange,
	getInt,
	getFrom0,
	getIntFrom0,
	shuffleArray,
	generateNumbers,
	uuidv4Options,
	uuid,
	selectRandom,
} from './Random';
import { v4 } from 'uuid';

describe('NotRandom', () => {
	it('should always generate the same number', () => {
		const random: Random = new NotRandom(0.5);

		expect(random.get()).toEqual(0.5);
		expect(random.get()).toEqual(0.5);
		expect(random.get()).toEqual(0.5);
		expect(random.get()).toEqual(0.5);
	});
});

describe('SeededRandom', () => {
	it('should always generate the same numbers with the same seed', () => {
		const random: Random = new SeededRandom(10);

		expect(random.get()).toMatchSnapshot();
		expect(random.get()).toMatchSnapshot();
		expect(random.get()).toMatchSnapshot();
		expect(random.get()).toMatchSnapshot();
	});
});

describe('random library', () => {
	const random: Random = new SeededRandom(10);
	const randomLow: Random = new NotRandom(0);
	const randomHigh: Random = new NotRandom(0.999999999);

	it('should get a number in the range specified', () => {
		expect(getRange(randomHigh)(5)(10)).toBeCloseTo(9.99999999);
		expect(getRange(randomLow)(5)(10)).toEqual(5);
		expect(getRange(random)(5)(10)).toMatchSnapshot();
	});

	it('should get an integer in the range specified', () => {
		expect(getInt(randomHigh)(5)(10)).toEqual(9);
		expect(getInt(randomLow)(5)(10)).toEqual(5);
		expect(getInt(random)(5)(10)).toMatchSnapshot();
	});

	it('should get a number from 0 to the number specified', () => {
		expect(getFrom0(randomHigh)(10)).toBeCloseTo(9.99999999);
		expect(getFrom0(randomLow)(10)).toEqual(0);
		expect(getFrom0(random)(10)).toMatchSnapshot();
	});

	it('should get an integer from 0 to the number specified', () => {
		expect(getIntFrom0(randomHigh)(10)).toEqual(9);
		expect(getIntFrom0(randomLow)(10)).toEqual(0);
		expect(getIntFrom0(random)(10)).toMatchSnapshot();
	});

	it('should shuffle an array', () => {
		const array = [0, 1, 2, 3, 4, 5];

		expect(shuffleArray(randomLow)(array)).toMatchObject(array);
		expect(shuffleArray(randomHigh)(array)).toMatchObject([...array].reverse());
		expect(shuffleArray(random)).toMatchSnapshot();
	});

	it('should generate numbers as an iterator', () => {
		const generatorLow = generateNumbers(randomLow)[Symbol.iterator]();
		const generator = generateNumbers(random)[Symbol.iterator]();
		const generatorHigh = generateNumbers(randomHigh)[Symbol.iterator]();

		expect(generatorLow.next().value).toEqual(0);
		expect(generatorLow.next().value).toEqual(0);
		expect(generatorLow.next().value).toEqual(0);

		expect(generatorHigh.next().value).toBeCloseTo(0.999);
		expect(generatorHigh.next().value).toBeCloseTo(0.999);
		expect(generatorHigh.next().value).toBeCloseTo(0.999);

		expect(generator.next().value).toMatchSnapshot();
		expect(generator.next().value).toMatchSnapshot();
		expect(generator.next().value).toMatchSnapshot();
	});

	it('should generate UUIDs', () => {
		const uuidOptions = uuidv4Options(random);

		expect(v4(uuidOptions)).toMatchSnapshot();
		expect(v4(uuidOptions)).toMatchSnapshot();
		expect(v4(uuidOptions)).toMatchSnapshot();

		expect(uuid(random)()).toMatchSnapshot();
		expect(uuid(random)()).toMatchSnapshot();
		expect(uuid(random)()).toMatchSnapshot();
	});

	it('should select an element from an array', () => {
		const elems = [0, 1, 2, 3];

		expect(selectRandom(randomLow)(elems)).toEqual(elems[0]);
	});
});
