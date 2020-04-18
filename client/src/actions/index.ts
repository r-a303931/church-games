import {
	Actions,
	Maybe,
	MaybeObj,
	Room,
	SmallRoom,
	RoomParticipant,
	SelfActions,
	SelfRoomLeaveAction,
} from 'common';
import { Dispatch } from 'react';
import { Action } from 'redux';

export const emitAction = (socket: SocketIOClient.Socket) => (
	action: SelfActions,
	done?: () => void
) => {
	socket.emit('action', action, done);
};

export interface ErrorAction extends Action<'ERROR'> {
	error: string;
}

export interface RoomAction extends Action<'GAME_ACTION'> {
	action: Actions;
}

// #region Authentication
interface LoadRoomsAction extends Action<'LOAD_ROOMS'> {
	rooms: SmallRoom[];
	me: RoomParticipant;
}

interface UpdateRoomsAction extends Action<'UPDATE_ROOMS'> {
	rooms: SmallRoom[];
}

export const login = (socket: SocketIOClient.Socket, name: string, email: string) => (
	dispatch: Dispatch<ClientActions>
) => {
	socket.emit(
		'login',
		{ name, email: !!email ? Maybe.some(email) : Maybe.none() },
		(rooms: SmallRoom[], me: RoomParticipant) => {
			dispatch({
				type: 'LOAD_ROOMS',
				rooms,
				me,
			});
		}
	);
};
//#endregion

//#region Room actions
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
				error: 'Invalid password',
			});
		}
	});
};

export const createRoom = (socket: SocketIOClient.Socket, id: string, password: string) => (
	dispatch: Dispatch<ClientActions>
) => {
	socket.emit(
		'create',
		id,
		!!password ? Maybe.some(password) : Maybe.none(),
		(room: MaybeObj<Room>) => {
			if (room.hasValue) {
				dispatch({
					type: 'LOAD_ROOM',
					room: room.value,
				});
			} else {
				dispatch({
					type: 'ERROR',
					error: 'Unknown error',
				});
			}
		}
	);
};

export const leaveRoom = (socket: SocketIOClient.Socket) => (dispatch: Dispatch<ClientActions>) => {
	emitAction(socket)({ type: 'LEAVE_ROOM' }, () => {
		console.log('dispatching');
		dispatch({
			type: 'LEAVE_ROOM',
		});
	});
};

export const sendChatMessage = (socket: SocketIOClient.Socket, message: string) => (
	dispatchEvent: Dispatch<ClientActions>
) => {
	emitAction(socket)({ type: 'NEW_CHAT', message });
};
//#endregion

export type ClientActions =
	| ErrorAction
	| UpdateRoomsAction
	| LoadRoomsAction
	| LoadRoomAction
	| SelfRoomLeaveAction
	| RoomAction;
