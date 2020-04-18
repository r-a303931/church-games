import { Actions, GameType, Room, RoomParticipant, Maybe } from 'common';
import { Middleware } from 'redux';
import { Server, Socket } from 'socket.io';
import { getSmallRooms } from '..';
import { ServerActions } from '../actions';
import { ServerState } from '../createStore';
import secureGameForMember from './secureGameForMember';
import participantRoom from './participantRoom';

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
		case 'JOIN_ROOM':
		case 'LEAVE_ROOM':
		case 'CREATE_ROOM': {
			let room = Maybe.none<Room>();
			if (action.type === 'LEAVE_ROOM') {
				room = participantRoom(store.getState())(action.participant.id);
			}

			next(action);

			if (action.type === 'JOIN_ROOM') {
				room = participantRoom(store.getState())(action.participant.id);
			}

			mainServer.emit('roomsUpdate', getSmallRooms(store.getState()));

			if (room.hasValue) {
				const dispatcher = dispatchToRoomForSockets(room.value);

				if (action.type === 'LEAVE_ROOM' || action.type === 'JOIN_ROOM') {
					dispatcher(action);
				}
			}

			break;
		}

		case 'ROOM_ACTION': {
			const roomBefore = store.getState().rooms[action.roomID];

			next(action);

			const roomAfter = store.getState().rooms[action.roomID];

			if (roomBefore) {
				console.log('running');
				console.log(action.action);

				if (action.action.type === 'GAME_ACTION' && roomAfter.hasGame) {
					const dispatcher = dispatchToRoomForSockets(roomAfter);
					if (
						action.action.gameType === GameType.UNO &&
						action.action.gameAction.type === 'INIT'
					) {
						dispatcher(participant => ({
							type: 'GAME_ACTION',
							gameAction: {
								type: 'INIT_DONE',
								readyGame: secureGameForMember(roomAfter.currentGame, participant),
							},
							gameType: GameType.UNO,
							participant,
						}));
					} else {
						dispatcher(action.action);
					}
				} else if (action.action.type === 'LEAVE_ROOM') {
					const dispatcher = dispatchToRoomForSockets(roomBefore);
					dispatcher(action.action);
					mainServer.emit('roomsUpdate', getSmallRooms(store.getState()));
				} else {
					const dispatcher = dispatchToRoomForSockets(roomAfter);
					dispatcher(action.action);
				}
			}

			break;
		}

		default:
			next(action);
	}
};
