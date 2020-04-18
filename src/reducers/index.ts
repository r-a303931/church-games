import { Maybe, Random, reducer } from 'common';
import { pipe } from 'ramda';
import { ServerActions } from '../actions';
import { ServerState } from '../createStore';
import participantRoom from '../lib/participantRoom';
import unoReducerGenerator from './uno';

export const defaultState: ServerState = {
	rooms: {},
	members: {},
};

export default (dateFunction: () => number) => (randomFunction: Random) => {
	const unoReducer = unoReducerGenerator(randomFunction);

	return (state: ServerState | undefined = defaultState, action: ServerActions): ServerState => {
		switch (action.type) {
			case 'INIT': {
				return state;
			}

			case 'ROOM_ACTION': {
				const room = state.rooms[action.roomID];

				if (!room) {
					return state;
				}

				const newRoom = reducer(dateFunction)(unoReducer)(room, action.action);

				console.log(newRoom.participants.length);

				if (newRoom.participants.length === 0) {
					const rooms = Object.assign({}, state.rooms);

					delete rooms[room.id];

					return {
						...state,
						rooms,
					};
				}

				return {
					...state,
					rooms: {
						...state.rooms,
						[room.id]: newRoom,
					},
				};
			}

			case 'PARTICIPANT_CONNECT':
				return {
					...state,
					members: {
						...state.members,
						[action.participant.id]: action.participant,
					},
				};

			case 'PARTICIPANT_DISCONNECT':
				const members = Object.assign({}, state.members);

				delete members[action.participant.id];

				return {
					...state,
					members,
				};

			case 'CREATE_ROOM': {
				if (participantRoom(state)(action.roomCreator.id).hasValue) {
					return state;
				}

				const { id, roomName, roomCreator, password } = action;

				return {
					...state,
					rooms: {
						...state.rooms,
						[action.id]: {
							chat: [],
							id,
							name: roomName,
							participants: [roomCreator],
							password,
							hasGame: false,
							playerIDs: [],
						},
					},
				};
			}

			case 'JOIN_ROOM': {
				if (participantRoom(state)(action.participant.id).hasValue) {
					return state;
				}

				const { roomID, participant, password } = action;

				const room = state.rooms[roomID];

				if (!room) {
					return state;
				}

				if (
					pipe(
						Maybe.map(p => p !== password),
						Maybe.orSome(false)
					)(room.password)
				) {
					return state;
				}

				return {
					...state,
					rooms: {
						...state.rooms,
						[roomID]: {
							...state.rooms[roomID],
							participants: [...state.rooms[roomID].participants, participant],
						},
					},
				};
			}

			case 'LEAVE_ROOM': {
				const { participant } = action;

				const roomObj = participantRoom(state)(participant.id);

				if (Maybe.isNone(roomObj)) {
					return state;
				}

				const room = roomObj.value;

				const participants = room.participants.filter(({ id }) => id !== participant.id);

				if (participants.length > 0) {
					return {
						...state,
						rooms: {
							...state.rooms,
							[room.id]: {
								...room,
								participants,
							},
						},
					};
				} else {
					const rooms = Object.assign({}, state.rooms);

					delete rooms[room.id];

					return {
						...state,
						rooms,
					};
				}
			}
		}
	};
};
