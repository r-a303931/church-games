import type { Actions, MaybeObj } from 'common';
import type { Action } from 'redux';
import { ServerRoomParticipant } from '../createStore';
import { v4 } from 'uuid';

export interface ParticipantConnectAction extends Action<'PARTICIPANT_CONNECT'> {
	participant: ServerRoomParticipant;
}

export interface ParticipantDisconnectAction extends Action<'PARTICIPANT_DISCONNECT'> {
	participant: ServerRoomParticipant;
}

export interface CreateRoom extends Action<'CREATE_ROOM'> {
	id: string;
	roomName: string;
	password: MaybeObj<string>;
	roomCreator: ServerRoomParticipant;
}

export interface RoomAction extends Action<'ROOM_ACTION'> {
	action: Actions;
	roomID: string;
}

export interface JoinRoomAction extends Action<'JOIN_ROOM'> {
	roomID: string;
	participant: ServerRoomParticipant;
	password: string;
}

export interface LeaveRoomAction extends Action<'LEAVE_ROOM'> {
	type: 'LEAVE_ROOM';
	participant: ServerRoomParticipant;
}

export type InitAction = Action<'INIT'>;

export const removeParticipant = (participant: ServerRoomParticipant): ServerActions => ({
	participant,
	type: 'PARTICIPANT_DISCONNECT',
});

export const addParticipant = (participant: ServerRoomParticipant): ServerActions => ({
	participant,
	type: 'PARTICIPANT_CONNECT',
});

export const createRoom = (roomCreator: ServerRoomParticipant) => (
	roomName: string,
	password: MaybeObj<string>
): ServerActions => ({
	type: 'CREATE_ROOM',
	id: v4(),
	password,
	roomName,
	roomCreator,
});

export const roomAction = (roomID: string) => (action: Actions): ServerActions => ({
	type: 'ROOM_ACTION',
	action,
	roomID,
});

export const joinRoom = (participant: ServerRoomParticipant) => (
	roomID: string,
	password: string
): ServerActions => ({
	type: 'JOIN_ROOM',
	participant,
	roomID,
	password,
});

export const leaveRoom = (participant: ServerRoomParticipant): ServerActions => ({
	type: 'LEAVE_ROOM',
	participant,
});

export type ServerActions =
	| InitAction
	| CreateRoom
	| LeaveRoomAction
	| ParticipantConnectAction
	| ParticipantDisconnectAction
	| RoomAction
	| JoinRoomAction;
