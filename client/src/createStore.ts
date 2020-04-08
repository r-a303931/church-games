import { Maybe, MaybeObj, Room, SmallRoom, RoomParticipant, Actions } from 'common';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ClientActions, login } from './actions';
import reducers from './reducers';
import { socket } from './socket';

interface ClientStateBase {
	error: MaybeObj<string>;
}

export interface ClientUnloaded extends ClientStateBase {
	state: 'UNLOADED';
}

export interface ClientLoaded extends ClientStateBase {
	state: 'LOADED_MAIN';
	rooms: SmallRoom[];
	me: RoomParticipant;
}

export interface ClientInRoom extends ClientStateBase {
	state: 'IN_GAME';
	game: Room;
	me: RoomParticipant;
}

export type ClientStateType = 'IN_GAME' | 'LOADED_MAIN' | 'UNLOADED';
export type ClientState = ClientUnloaded | ClientLoaded | ClientInRoom;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
	const store = createStore(
		reducers,
		{ state: 'UNLOADED', error: Maybe.none() },
		composeEnhancers(applyMiddleware(thunk))
	);

	if (process.env.NODE_ENV === 'development') {
		if (module.hot) {
			module.hot.accept('./reducers', () => {
				store.replaceReducer(reducers);
			});
		}
	}

	socket.on('roomsUpdate', (rooms: SmallRoom[]) => {
		store.dispatch({
			type: 'UPDATE_ROOMS',
			rooms,
		});
	});

	socket.on('action', (action: Actions) => {
		store.dispatch({
			type: 'GAME_ACTION',
			action,
		});
	});

	socket.on('reconnecting', () => {
		console.log('Reconnecting');
	});

	socket.on('reconnect', () => {
		console.log('Reconnected');
		const state = store.getState();

		if (state && state.state !== 'UNLOADED') {
			console.log('Signing back in');
			login(
				socket,
				state.me.name,
				Maybe.orSome('')(state.me.email)
			)(store.dispatch.bind(store));
		}
	});

	return store;
};

export type ThunkDispatcher = ThunkDispatch<ClientState, undefined, ClientActions>;
