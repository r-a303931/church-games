import { Maybe, reducer } from 'common';
import { ClientActions } from '../actions';
import { ClientState } from '../createStore';
// Game reducers
import unoReducer from './uno';

const defaultState: ClientState = {
	state: 'UNLOADED',
	error: Maybe.none(),
};

export default (dateFunction: () => number) => (
	state: ClientState = defaultState,
	action: ClientActions
): ClientState => {
	switch (action.type) {
		case 'LOAD_ROOMS':
			return {
				state: 'LOADED_MAIN',
				rooms: action.rooms,
				error: Maybe.none(),
				me: action.me,
			};

		case 'LOAD_ROOM':
			if (state.state === 'UNLOADED') {
				return state;
			}

			return {
				state: 'IN_GAME',
				game: action.room,
				error: Maybe.none(),
				me: state.me,
				rooms: state.rooms,
			};

		case 'ERROR':
			return {
				...state,
				error: Maybe.some(action.error),
			};

		case 'GAME_ACTION':
			if (state.state !== 'IN_GAME') {
				return state;
			}

			if (
				action.action.type === 'LEAVE_ROOM' &&
				action.action.participant.id === state.me.id
			) {
				return {
					state: 'LOADED_MAIN',
					error: Maybe.none(),
					me: state.me,
					rooms: state.rooms,
				};
			}

			return {
				...state,
				game: reducer(dateFunction)(unoReducer)(state.game, action.action),
			};

		case 'UPDATE_ROOMS':
			if (state.state === 'UNLOADED') {
				// Can't say we are loaded, as we don't have participant information
				return state;
			}

			return {
				...state,
				rooms: action.rooms,
			};

		case 'LEAVE_ROOM': {
			if (state.state === 'UNLOADED') {
				return {
					state: state.state,
					error: Maybe.none(),
				};
			}

			return {
				state: 'LOADED_MAIN',
				error: Maybe.none(),
				me: state.me,
				rooms: state.rooms,
			};
		}
	}
};
