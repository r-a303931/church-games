import { Room, GameType, UNO } from '../types';
import { Actions } from '../actions';
import { Maybe, Some } from '../lib';
import unoReducer from './uno';

export { unoReducer };

/**
 * Why in the world would this accept another reducer as a function?
 *
 * This is so that te client and server can have different implementations of things such as init
 */
export default (unoReducerFunc: typeof unoReducer) => (state: Room, action: Actions): Room => {
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
			if (!state.currentGame.hasValue || action.gameType !== state.currentGame.value.type) {
				return state;
			}

			switch (action.gameType) {
				case GameType.UNO:
					return {
						...state,
						currentGame: Maybe.map<UNO.Game, UNO.Game>(game =>
							unoReducerFunc(game, action.gameAction)
						)(state.currentGame as Some<UNO.Game>),
					};
			}
		}
	}
};
