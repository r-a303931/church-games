import { Game, GameType, Maybe, MaybeObj, Room, SmallRoom, matchByProp } from 'common';
import * as express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { pipe } from 'ramda';
import * as io from 'socket.io';
import { v4 } from 'uuid';
import { addParticipant, removeParticipant } from './actions';
import createStore, { ServerRoomParticipant, ServerState, ServerStore } from './createStore';

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

const wanderers: { [key: string]: ServerRoomParticipant } = {};
const rooms: { [key: string]: { namespace: io.Namespace; store: ServerStore } } = {};

websocketServer.on('connect', socket => {
	console.log('Client connection made');

	socket.once(
		'login',
		(
			{ name, email }: { name: string; email: MaybeObj<string> },
			ack: (rooms: SmallRoom[]) => void
		) => {
			console.log('Client "connect" event');

			const conn = v4();
			const participant = {
				email,
				name,
				id: v4(),
				socket,
			};
			let currentRoom: ServerState | null = null;

			wanderers[conn] = participant;

			socket.on(
				'join',
				(id: string, password: string, ackJoin: (room: MaybeObj<Room>) => void) => {
					if (!!currentRoom) {
						return ackJoin(Maybe.none());
					}

					const room = rooms[id];

					if (!room) {
						return ackJoin(Maybe.none());
					}

					const roomObject = room.store.getState();

					if (
						pipe(
							Maybe.map(roomPassword => roomPassword === password),
							Maybe.orSome(true)
						)(roomObject.password)
					) {
						// Remove them from the wanderers list
						delete wanderers[conn];

						currentRoom = room.store.getState();

						room.store.dispatch(addParticipant(participant));

						room.store.subscribe(() => {
							const obj = room.store.getState();

							if (
								!obj.participants.find(
									matchByProp<ServerRoomParticipant>('id')(participant)
								)
							) {
								wanderers[conn] = participant;
								currentRoom = null;
							}
						});

						return ackJoin(Maybe.some(roomObject));
					} else {
						return ackJoin(Maybe.none());
					}
				}
			);

			socket.on(
				'create',
				(
					roomName: string,
					password: MaybeObj<string>,
					ackCreate: (room: MaybeObj<Room>) => void
				) => {
					if (!!currentRoom) {
						return ackCreate(Maybe.none());
					}

					const store = createStore(roomName, password);

					const namespaceID = store.getState().id;

					const namespace = websocketServer.of(namespaceID);

					rooms[namespaceID] = {
						namespace,
						store,
					};

					delete wanderers[conn];

					currentRoom = store.getState();

					rooms[namespaceID].store.dispatch(addParticipant(participant));

					ackCreate(Maybe.some(store.getState()));
				}
			);

			socket.on('disconnect', () => {
				if (wanderers[conn]) {
					delete wanderers[conn];
				}

				if (currentRoom && rooms[currentRoom.id]) {
					const roomObj = rooms[currentRoom.id];

					roomObj.store.dispatch(removeParticipant(participant));

					if (roomObj.store.getState().participants.length === 0) {
						roomObj.namespace.removeAllListeners();

						delete websocketServer.nsps[currentRoom.id];

						delete rooms[currentRoom.id];
					}
				}
			});

			const smallRooms: SmallRoom[] = Object.values(rooms)
				.map(({ store }) => store.getState())
				.map(state => ({
					currentGame: Maybe.map<Game, GameType>(game => game.type)(state.currentGame),
					id: state.id,
					name: state.name,
					needsPassword: state.password.hasValue,
					participantCount: state.participants.length,
				}));

			ack(smallRooms);
		}
	);
});
