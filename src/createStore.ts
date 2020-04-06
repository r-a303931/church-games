import { Maybe, MaybeObj, Room, RoomParticipant } from 'common';
import { applyMiddleware, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import { v4 } from 'uuid';
import { ServerActions } from './actions';
import reducers from './reducers';

export interface ServerRoomParticipant extends RoomParticipant {
	socket: SocketIO.Socket;
}

/**
 * This represents all the information the server holds
 */
export type ServerState = Room<ServerRoomParticipant>;

export type ServerStore = Store<ServerState, ServerActions>;

const createDefaultValue = (name: string, password: MaybeObj<string>): ServerState => ({
	chat: [],
	currentGame: Maybe.none(),
	id: v4(),
	name,
	participants: [],
	password,
});

export default (roomName: string, password: MaybeObj<string>): ServerStore =>
	process.env.NODE_ENV === 'development'
		? createStore(
				reducers,
				createDefaultValue(roomName, password),
				applyMiddleware(createLogger({}))
		  )
		: createStore(reducers, createDefaultValue(roomName, password));
