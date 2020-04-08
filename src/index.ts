import { Game, GameType, Maybe, MaybeObj, RoomParticipant, SmallRoom, Room } from 'common';
import * as express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import * as io from 'socket.io';
import { v4 } from 'uuid';
import { addParticipant, createRoom, joinRoom, removeParticipant, leaveRoom } from './actions';
import createStore, { ServerState, ServerRoomParticipant } from './createStore';
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
	Object.values(state?.rooms ?? []).map(({ currentGame, id, name, password, participants }) => ({
		currentGame: Maybe.map<Game, GameType>(game => game.type)(currentGame),
		id,
		name,
		needsPassword: password.hasValue,
		participantCount: participants.length,
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
					const returnValue = participantRoom(state)(participant.id);
					ackJoin(returnValue);
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
					const returnValue = participantRoom(state)(participant.id);
					ackCreate(returnValue);
				}
			);

			socket.on('disconnect', () => {
				delete sockets[participant.id];

				store.dispatch(removeParticipant(participant));
				store.dispatch(leaveRoom(participant));
			});

			ack(getSmallRooms(store.getState()), {
				email,
				name,
				id: participant.id,
			});
		}
	);
});
