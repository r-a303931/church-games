import { Room, SmallRoom } from 'common';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import { ClientActions } from './actions';
import reducers from './reducers';

interface ClientStateBase {
	socket: SocketIOClient.Socket;
}

interface ClientUnloaded extends ClientStateBase {
	state: 'UNLOADED';
}

interface ClientLoaded extends ClientStateBase {
	state: 'LOADED_MAIN';
	rooms: SmallRoom[];
}

interface ClientInGame extends ClientStateBase {
	state: 'IN_GAME';
	socket: SocketIOClient.Socket;
	game: Room;
}

export type ClientStateType = 'IN_GAME' | 'LOADED_MAIN' | 'UNLOADED';
export type ClientState = ClientUnloaded | ClientLoaded | ClientInGame;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () =>
	createStore(reducers, composeEnhancers(applyMiddleware(thunk))) as Store<
		ClientState,
		ClientActions
	>;
