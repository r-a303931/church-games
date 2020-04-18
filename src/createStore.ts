import { PseudoRandom, Room, RoomParticipant } from 'common';
import { applyMiddleware, createStore, Store } from 'redux';
import * as io from 'socket.io';
import { ServerActions } from './actions';
import syncStateMiddleware from './lib/syncStateMiddleware';
import reducers, { defaultState } from './reducers';
import { createLogger } from 'redux-logger';

export type ServerRoomParticipant = RoomParticipant;
/**
 * This represents all the information the server holds
 */
export interface ServerState {
	/**
	 * The key is the Room.id property
	 */
	rooms: { [key: string]: Room };

	/**
	 * This is everyone who has signed in
	 *
	 * Again, key is the .id property
	 */
	members: { [key: string]: ServerRoomParticipant };
}

export type ServerStore = Store<ServerState, ServerActions>;

export default (websocketServer: io.Server, sockets: { [key: string]: io.Socket }): ServerStore => {
	const store = createStore(
		reducers(Date.now)(new PseudoRandom()),
		defaultState,
		applyMiddleware(
			createLogger({ colors: false }),
			syncStateMiddleware(websocketServer, sockets)
		)
	);

	store.dispatch({ type: 'INIT' });

	return store;
};
