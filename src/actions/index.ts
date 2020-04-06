import type { Action } from 'redux';
import type { Actions } from 'common';
import { ServerRoomParticipant } from '../createStore';

export interface ParticipantConnectAction extends Action<'PARTICIPANT_CONNECT'> {
	participant: ServerRoomParticipant;
}

export const addParticipant = (participant: ServerRoomParticipant): ParticipantConnectAction => ({
	participant,
	type: 'PARTICIPANT_CONNECT',
});

export interface ParticipantDisconnectAction extends Action<'PARTICIPANT_DISCONNECT'> {
	participant: ServerRoomParticipant;
}

export const removeParticipant = (
	participant: ServerRoomParticipant
): ParticipantDisconnectAction => ({
	participant,
	type: 'PARTICIPANT_DISCONNECT',
});

export type ServerActions = ParticipantConnectAction | ParticipantDisconnectAction | Actions;
