import { Room } from 'common';

export default (room: Room): Room => ({
	chat: room.chat,
	id: room.id,
	name: room.name,
	participants: room.participants.map(({ name: pName, email, id: pId }) => ({
		name: pName,
		email,
		id: pId,
	})),
	password: room.password,
	...(room.hasGame
		? {
				hasGame: true,
				currentGame: room.currentGame,
		  }
		: {
				hasGame: false,
				playerIDs: room.playerIDs,
		  }),
});
