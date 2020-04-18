import { Actions, Maybe, MaybeObj, Room, RoomParticipant, SelfActions, SmallRoom } from 'common';
import * as express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import * as io from 'socket.io';
import { v4 } from 'uuid';
import {
	addParticipant,
	createRoom,
	joinRoom,
	leaveRoom,
	removeParticipant,
	RoomAction,
} from './actions';
import createStore, { ServerRoomParticipant, ServerState } from './createStore';
import participantRoom from './lib/participantRoom';

const app: express.Application = express();
const httpServer = createServer(app);
const websocketServer = io(httpServer);

app.set('port', 3001);
app.disable('x-powered-by');
httpServer.listen(3001);
httpServer.on('listening', () => {
	console.log('Server bound');
});

app.use((req, res, next) => {
	res.removeHeader('X-Powered-By');
	next();
});
app.disable('x-powered-by');

const clientBuildPath = join(__dirname, '..', 'client', 'build');

app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
	res.sendFile(join(clientBuildPath, 'index.html'));
});

const sockets: { [key: string]: SocketIO.Socket } = {};
const store = createStore(websocketServer, sockets);

export const getSmallRooms = (state: ServerState | undefined): SmallRoom[] =>
	Object.values(state?.rooms ?? []).map(room => ({
		currentGame: room.hasGame ? Maybe.some(room.currentGame.type) : Maybe.none(),
		id: room.id,
		name: room.name,
		needsPassword: room.password.hasValue,
		participantCount: room.participants.length,
	}));

websocketServer.on('connect', socket => {
	console.log('Client connection made');

	socket.once(
		'login',
		(
			{ name, email }: { name: string; email: MaybeObj<string> },
			ack: (rooms: SmallRoom[], participant: RoomParticipant) => void
		) => {
			console.log('Client "connect" event');

			const participant: ServerRoomParticipant = {
				email,
				name,
				id: v4(),
			};

			sockets[participant.id] = socket;

			store.dispatch(addParticipant(participant));

			socket.on(
				'join',
				(id: string, password: string, ackJoin: (room: MaybeObj<Room>) => void) => {
					store.dispatch(joinRoom(participant)(id, password));

					const state = store.getState();
					ackJoin(participantRoom(state)(participant.id));
				}
			);

			socket.on(
				'create',
				(
					roomName: string,
					password: MaybeObj<string>,
					ackCreate: (room: MaybeObj<Room>) => void
				) => {
					store.dispatch(createRoom(participant)(roomName, password));

					const state = store.getState();
					ackCreate(participantRoom(state)(participant.id));
				}
			);

			socket.on('disconnect', () => {
				delete sockets[participant.id];

				store.dispatch(removeParticipant(participant));
				store.dispatch(leaveRoom(participant));
			});

			socket.on('action', (action: SelfActions, done: () => void) => {
				const state = store.getState();
				const room = participantRoom(state)(participant.id);

				if (room.hasValue) {
					const newAction: Actions = { ...action, participant };

					const roomAction: RoomAction = {
						action: newAction,
						roomID: room.value.id,
						type: 'ROOM_ACTION',
					};

					store.dispatch(roomAction);
				}

				done?.();
			});

			ack(getSmallRooms(store.getState()), {
				email,
				name,
				id: participant.id,
			});
		}
	);
});
