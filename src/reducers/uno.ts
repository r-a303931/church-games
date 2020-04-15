import {
	GameType,
	Random,
	selectRandom as selectRandomBase,
	shuffleArray,
	UNO,
	unoReducer,
	uuid as uuidBase,
} from 'common';
import { UnoActions } from 'common/dist/actions/uno';
import { FullUnoReducer } from 'common/dist/reducers/uno';
import { CardColor, CardType, CardValue, HandCard } from 'common/dist/types/uno';

const defaultDeck: Omit<HandCard, 'id'>[] = [
	{
		type: CardType.WILD,
	},
	{
		type: CardType.WILD,
	},
	{
		type: CardType.WILD_DRAW_4,
	},
	{
		type: CardType.WILD_DRAW_4,
	},
	...[CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW, CardColor.BLUE].flatMap(color =>
		[
			CardValue.ZERO,
			CardValue.ONE,
			CardValue.TWO,
			CardValue.THREE,
			CardValue.FOUR,
			CardValue.FIVE,
			CardValue.SEVEN,
			CardValue.EIGHT,
			CardValue.NINE,
			CardValue.REVERSE,
			CardValue.SKIP,
			CardValue.DRAW2,
		].map(value => ({
			color,
			value,
			type: CardType.COLOR,
		}))
	),
];

export default (randomFunction: Random): FullUnoReducer => {
	const selectRandom = selectRandomBase(randomFunction);
	const shuffle = shuffleArray(randomFunction);
	const uuid = uuidBase(randomFunction);

	return (game: UNO.Game, action: UnoActions): UNO.Game => {
		if (action.type === 'INIT') {
			let deck = shuffle(defaultDeck).map(
				card =>
					({
						...card,
						id: uuid(),
					} as HandCard)
			);

			let firstCard = deck[0];
			while (
				firstCard.type !== CardType.COLOR ||
				firstCard.value === CardValue.DRAW2 ||
				firstCard.value === CardValue.REVERSE ||
				firstCard.value === CardValue.SKIP
			) {
				deck = shuffle(deck);
				firstCard = deck[0];
			}
			deck = deck.slice(1);

			const players = action.playerIDs.map(playerID => {
				const cards = deck.slice(0, 7);
				deck = deck.slice(7);

				return {
					playerID,
					cards,
				};
			});

			return {
				currentPlayerID: selectRandom(action.playerIDs),
				deck,
				discardPile: [firstCard],
				players,
				type: GameType.UNO,
			};
		}

		if (action.type === 'INIT_DONE') {
			throw new Error('Server received `INIT_DONE` action');
		}

		return unoReducer(game, action);
	};
};
