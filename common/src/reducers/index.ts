import { Actions } from '../actions';
import { GameType, Room } from '../types';
import unoReducer, { FullUnoReducer } from './uno';

export { unoReducer };

/**
 * Why in the world would this accept another reducer as a function?
 *
 * This is so that the client and server can have different implementations of things such as init
 */
export default (currentTime: () => number) => (unoReducerFunc: FullUnoReducer) => (
	state: Room,
	action: Actions
): Room => {
	switch (action.type) {
		case 'JOIN_ROOM': {
			return {
				...state,
				participants: [...state.participants, action.participant],
			};
		}

		case 'LEAVE_ROOM': {
			return {
				...state,
				participants: state.participants.filter(({ id }) => id !== action.participant.id),
			};
		}

		case 'GAME_ACTION': {
			if (!state.hasGame || action.gameType !== state.currentGame.type) {
				return state;
			}

			switch (action.gameType) {
				case GameType.UNO:
					return {
						...state,
						currentGame: unoReducerFunc(state.currentGame, action.gameAction),
					};
			}
		}

		case 'NEW_CHAT': {
			const {
				message,
				participant: { id: senderID },
			} = action;

			return {
				...state,
				chat: [
					...state.chat,
					{
						message,
						senderID,
						sent: currentTime(),
					},
				],
			};
		}
	}
};
