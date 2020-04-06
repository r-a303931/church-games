import { GameType } from '.';

/**
 * Used to determine the type of card as part of the descriminant
 */
export enum CardType {
	COLOR,
	WILD,
	WILD_DRAW_4,
	UNKNOWN,
}

/**
 * Used to determine the color of the card
 */
export enum CardColor {
	RED,
	GREEN,
	BLUE,
	YELLOW,
}

/**
 * What is on a color card?
 */
export enum CardValue {
	ZERO,
	ONE,
	TWO,
	THREE,
	FOUR,
	FIVE,
	SIX,
	SEVEN,
	EIGHT,
	NINE,
	SKIP,
	DRAW2,
	REVERSE,
}

/**
 * Represents the flow of the game, used to find who goes next
 */
export enum GameDirection {
	LEFT,
	RIGHT,
}

/**
 * Has properties that all cards have
 */
export interface CardBase {
	/**
	 * A unique ID
	 */
	id: string;
}

/**
 * A card that has a value and a color on it
 */
export interface ColorCard extends CardBase {
	type: CardType.COLOR;

	value: CardValue;

	color: CardColor;
}

/**
 * A wild card that can be used to set the color to any color
 */
export interface WildCard extends CardBase {
	type: CardType.WILD;
}

/**
 * Represents a wild card that can also make someone pick up 4 cards
 */
export interface WildDraw4Card extends CardBase {
	type: CardType.WILD_DRAW_4;
}

/**
 * Used so that the server can tell the client a player has cards, and render them,
 * but doesn't allow for cheating
 */
export interface UnknownCard extends CardBase {
	type: CardType.UNKNOWN;
}

/**
 * All the different types of cards that can be used in Uno
 */
export type HandCard = ColorCard | WildCard | WildDraw4Card | UnknownCard;

/**
 * Used when the wild cards are played
 */
export interface PlayedWildCard extends CardBase {
	type: CardType.WILD;

	color: CardColor;
}

export interface PlayedWildDraw4Card extends CardBase {
	type: CardType.WILD_DRAW_4;

	color: CardColor;
}

/**
 * All the different types of cards that are used in Uno
 */
export type PlayedCard = ColorCard | PlayedWildCard | PlayedWildDraw4Card;

/**
 * Represents someone who is playing the game
 */
export interface Player {
	/**
	 * The hand a player is dealt and uses
	 */
	cards: HandCard[];

	/**
	 * Who is this player?
	 */
	playerID: string;
}

/**
 * Contains information about a single game
 */
export interface Game {
	/**
	 * These are the cards not yet dealt
	 */
	deck: HandCard[];

	/**
	 * The discard pile contains cards that have already been played
	 */
	discardPile: PlayedWildDraw4Card[];

	/**
	 * Represents each player in the started game
	 */
	players: Player[];

	/**
	 * Represents the player who is to go next
	 */
	currentPlayer: Player;

	/**
	 * Used to differentiate between games
	 */
	type: GameType.UNO;
}
