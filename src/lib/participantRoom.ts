import { ServerState } from '../createStore';
import { Maybe, MaybeObj, Room } from 'common';

export default (state: ServerState) => (participantID: string): MaybeObj<Room> => {
	for (const roomID in state.rooms) {
		if (state.rooms.hasOwnProperty(roomID)) {
			const room = state.rooms[roomID];

			if (room.participants.find(participant => participant.id === participantID)) {
				return Maybe.some(room);
			}
		}
	}

	return Maybe.none();
};
