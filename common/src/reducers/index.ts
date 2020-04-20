import { Actions } from '../actions';
import { GameType, Room } from '../types';
import unoReducer, { FullUnoReducer } from './uno';
import { Maybe, unolib } from '../lib';

export { unoReducer };

const gameFilters = {
	[GameType.UNO]: unolib.isEnoughPlayers,
};

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
			if (!state.hasGame) {
				return {
					...state,
					playerIDs: state.playerIDs.filter(id => id !== action.participant.id),
					participants: state.participants.filter(
						({ id }) => id !== action.participant.id
					),
				};
			}

			return {
				...state,
				participants: state.participants.filter(({ id }) => id !== action.participant.id),
			};
		}

		case 'GAME_ACTION': {
			if (!state.hasGame) {
				if (action.gameAction.type === 'INIT' || action.gameAction.type === 'INIT_DONE') {
					switch (action.gameType) {
						case GameType.UNO:
							return {
								chat: state.chat,
								currentGame: unoReducerFunc(undefined, action.gameAction),
								hasGame: true,
								id: state.id,
								name: state.name,
								participants: state.participants,
								password: state.password,
							};
					}
				} else {
					return state;
				}
			}

			if (action.gameType !== state.currentGame.type) {
				return state;
			}

			if (action.gameAction.type === 'INIT_DONE' || action.gameAction.type === 'INIT') {
				return state;
			}

			switch (action.gameType) {
				case GameType.UNO:
					return {
						...state,
						currentGame: unoReducerFunc(state.currentGame, action.gameAction),
					};

				default:
					return state;
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

		case 'SELECT_GAME_TYPE': {
			if (state.hasGame) {
				return state;
			}

			return {
				...state,
				gameSelection: Maybe.some(action.gameType),
			};
		}

		case 'UNREADY_UP': {
			if (state.hasGame || !('participant' in action)) {
				return state;
			}

			const playerIDs = state.playerIDs.filter(id => id !== action.participant.id);

			const gameSelection = Maybe.filter<GameType>(game =>
				gameFilters[game](playerIDs.length)
			)(state.gameSelection);

			return {
				...state,
				playerIDs,
				gameSelection,
			};
		}

		case 'READY_UP': {
			if (state.hasGame || !('participant' in action)) {
				return state;
			}

			const playerIDs = [...state.playerIDs, action.participant.id];

			const gameSelection = Maybe.filter<GameType>(game =>
				gameFilters[game](playerIDs.length)
			)(state.gameSelection);

			return {
				...state,
				gameSelection,
				playerIDs,
			};
		}
	}
};
