import { Maybe, reducer } from 'common';
import { ClientActions } from '../actions';
import { ClientState } from '../createStore';
// Game reducers
import unoReducer from './uno';

const defaultState: ClientState = {
	state: 'UNLOADED',
	error: Maybe.none(),
};

export default (state: ClientState = defaultState, action: ClientActions): ClientState => {
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

			return {
				...state,
				game: reducer(unoReducer)(state.game, action.action),
			};

		case 'UPDATE_ROOMS':
			if (state.state !== 'LOADED_MAIN') {
				return state;
			}

			return {
				...state,
				rooms: action.rooms,
			};
	}
};
