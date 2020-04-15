import { Actions, GameType, Room, RoomParticipant } from 'common';
import { Middleware } from 'redux';
import { Server, Socket } from 'socket.io';
import { getSmallRooms } from '..';
import { ServerActions } from '../actions';
import { ServerState } from '../createStore';
import secureGameForMember from './secureGameForMember';

export type ActionGenerator = (participant: RoomParticipant) => Actions;

const dispatchToRoom = (sockets: { [key: string]: Socket }) => (room: Room) => (
	action: Actions | ActionGenerator
) => {
	for (const member of room.participants) {
		if (sockets[member.id]) {
			if (typeof action === 'function') {
				sockets[member.id].emit('action', action(member));
			} else {
				sockets[member.id].emit('action', action);
			}
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
				const dispatcher = dispatchToRoomForSockets(room);

				if (action.action.type === 'GAME_ACTION' && room.hasGame) {
					if (
						action.action.gameType === GameType.UNO &&
						action.action.gameAction.type === 'INIT'
					) {
						dispatcher(participant => ({
							type: 'GAME_ACTION',
							gameAction: {
								type: 'INIT_DONE',
								readyGame: secureGameForMember(room.currentGame, participant),
							},
							gameType: GameType.UNO,
						}));
					} else {
						dispatcher(action.action);
					}
				} else {
					dispatcher(action.action);
				}
			}

			break;
		}

		default:
			next(action);
	}
};
