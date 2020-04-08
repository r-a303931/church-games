import { ServerRoomParticipant } from '../createStore';
import { Room } from 'common';

export default ({
	chat,
	currentGame,
	id,
	name,
	participants,
	password,
}: Room<ServerRoomParticipant>): Room => ({
	chat,
	currentGame,
	id,
	name,
	participants: participants.map(({ name: pName, email, id: pId }) => ({
		name: pName,
		email,
		id: pId,
	})),
	password,
});
