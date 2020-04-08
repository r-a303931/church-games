import { Actions, Room } from 'common';
import { Middleware } from 'redux';
import { Server, Socket } from 'socket.io';
import { getSmallRooms } from '..';
import { ServerActions } from '../actions';
import { ServerState } from '../createStore';

const dispatchToRoom = (sockets: { [key: string]: Socket }) => (room: Room) => (
	action: Actions
) => {
	for (const member of room.participants) {
		if (sockets[member.id]) {
			sockets[member.id].emit('action', action);
		}
	}
};

export default (
	mainServer: Server,
	sockets: { [key: string]: Socket }
): Middleware<{}, ServerState> => store => next => (action: ServerActions) => {
	const dispatchToRoomForSockets = dispatchToRoom(sockets);

	switch (action.type) {
		case 'PARTICIPANT_DISCONNECT':
		case 'JOIN_ROOM':
		case 'LEAVE_ROOM':
		case 'CREATE_ROOM': {
			next(action);

			mainServer.emit('roomsUpdate', getSmallRooms(store.getState()));

			break;
		}

		case 'ROOM_ACTION': {
			next(action);

			const room = store.getState().rooms[action.roomID];

			if (room) {
				dispatchToRoomForSockets(room)(action.action);
			}

			break;
		}

		default:
			next(action);
	}
};
