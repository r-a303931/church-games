import { Actions, Maybe, SmallRoom, MaybeObj, Room } from 'common';
import { Dispatch } from 'react';
import { Action } from 'redux';

interface ErrorAction extends Action<'ERROR'> {
	error: string;
}

// #region Authentication
interface LoadRoomsAction extends Action<'LOAD_ROOMS'> {
	rooms: SmallRoom[];
}

export const login = (socket: SocketIOClient.Socket, name: string, email: string) => (
	dispatch: Dispatch<ClientActions>
) => {
	socket.emit(
		'login',
		{ name, email: !!email ? Maybe.some(email) : Maybe.none() },
		(rooms: SmallRoom[]) => {
			dispatch({
				type: 'LOAD_ROOMS',
				rooms,
			});
		}
	);
};

interface LoadRoomAction extends Action<'LOAD_ROOM'> {
	room: Room;
}

export const joinRoom = (socket: SocketIOClient.Socket, id: string, password: string) => (
	dispatch: Dispatch<ClientActions>
) => {
	socket.emit('join', id, password, (room: MaybeObj<Room>) => {
		if (room.hasValue) {
			dispatch({
				type: 'LOAD_ROOM',
				room: room.value,
			});
		} else {
			dispatch({
				type: 'ERROR',
				error: 'Incorrect password',
			});
		}
	});
};
//#endregion

export type ClientActions = ErrorAction | LoadRoomsAction | LoadRoomAction | Actions;
