import { Actions, Maybe, SmallRoom } from 'common';
import { Dispatch } from 'react';
import { Action } from 'redux';

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
//#endregion

export type ClientActions = LoadRoomsAction | Actions;
