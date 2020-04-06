import { MaybeObj } from '../lib/Maybe';
import * as UNO from './uno';
export { UNO };

/**
 * Allows for differentiating between games
 */
export enum GameType {
	UNO,
}

/**
 * Represents the different kind of games a room may have
 */
export type Game = UNO.Game;

/**
 * Represents a person in the room
 */
export interface RoomParticipant {
	/**
	 * Allows for duplicate names, and identification in games and chat
	 */
	id: string;

	/**
	 * The display name for someone
	 */
	name: string;

	/**
	 * The email used to get a gravatar
	 */
	email: MaybeObj<string>;
}

/**
 * Holds an item used for chat
 */
export interface ChatItem {
	/**
	 * When was the message sent?
	 */
	sent: number;
	/**
	 * What is the text?
	 */
	message: string;
	/**
	 * Who sent it?
	 */
	senderID: string;
}

/**
 * This interface is generic so that the server can use a different RoomParticipant type which
 * includes a socket
 */
export interface Room<RoomParticipantType extends RoomParticipant = RoomParticipant> {
	/**
	 * Used for addressing
	 */
	id: string;

	/**
	 * What to call the room and display as
	 */
	name: string;

	/**
	 * Necessary if the room participants want a password
	 */
	password: MaybeObj<string>;

	/**
	 * Used to represent the current game
	 */
	currentGame: MaybeObj<Game>;

	/**
	 * Contains the chat log
	 */
	chat: ChatItem[];

	/**
	 * The room participants, who can all chat
	 */
	participants: RoomParticipantType[];
}

/**
 * A more secure object than Room to send
 *
 * If Room was sent to the client, anyone could scrape info such as
 * emails, the password, the chat log, or the current game state
 */
export interface SmallRoom {
	/**
	 * Used for addressing
	 */
	id: string;

	/**
	 * What to call the room and display as
	 */
	name: string;

	/**
	 * Does the client need a password?
	 */
	needsPassword: boolean;

	/**
	 * Which game is being played?
	 */
	currentGame: MaybeObj<GameType>;

	/**
	 * How many people are in the room?
	 */
	participantCount: number;
}
