import { Maybe, MaybeObj, Room, SmallRoom } from 'common';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ClientActions } from './actions';
import reducers from './reducers';
import { socket } from './socket';

interface ClientStateBase {
	socket: SocketIOClient.Socket;
	error: MaybeObj<string>;
}

export interface ClientUnloaded extends ClientStateBase {
	state: 'UNLOADED';
}

export interface ClientLoaded extends ClientStateBase {
	state: 'LOADED_MAIN';
	rooms: SmallRoom[];
}

export interface ClientInGame extends ClientStateBase {
	state: 'IN_GAME';
	socket: SocketIOClient.Socket;
	game: Room;
}

export type ClientStateType = 'IN_GAME' | 'LOADED_MAIN' | 'UNLOADED';
export type ClientState = ClientUnloaded | ClientLoaded | ClientInGame;

export const getSocket = (state: ClientStateBase = { socket, error: Maybe.none() }) => ({
	socket: state.socket,
});

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
	const store = createStore(
		reducers,
		{ socket, state: 'UNLOADED', error: Maybe.none() },
		composeEnhancers(applyMiddleware(thunk))
	);

	if (process.env.NODE_ENV === 'development') {
		if (module.hot) {
			module.hot.accept('./reducers', () => {
				store.replaceReducer(reducers);
			});
		}
	}

	return store;
};

export type ThunkDispatcher = ThunkDispatch<ClientState, undefined, ClientActions>;
