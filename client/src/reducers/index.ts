import { ClientState } from '../createStore';
import { ClientActions } from '../actions';
import { socket } from '../socket';
import { Maybe } from 'common';

const defaultState: ClientState = {
	state: 'UNLOADED',
	socket,
	error: Maybe.none(),
};

export default (state: ClientState = defaultState, action: ClientActions): ClientState => {
	switch (action.type) {
		case 'LOAD_ROOMS':
			return {
				state: 'LOADED_MAIN',
				socket: state.socket,
				rooms: action.rooms,
				error: Maybe.none(),
			};

		case 'LOAD_ROOM':
			return {
				state: 'IN_GAME',
				socket: state.socket,
				game: action.room,
				error: Maybe.none(),
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

			return state;
	}
};
