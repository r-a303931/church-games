import { ClientState } from '../createStore';
import { ClientActions } from '../actions';
import io from 'socket.io-client';

export const socket = io('localhost:3001', {
	autoConnect: true,
});

const defaultState: ClientState = {
	state: 'UNLOADED',
	socket,
};

export default (state = defaultState, action: ClientActions) => state;
