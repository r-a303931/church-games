import { Action } from 'redux';
import { UnoActions } from './uno';
import { GameType, RoomParticipant } from '../types';

export interface UnoAction extends Action<'GAME_ACTION'> {
	gameType: GameType;

	gameAction: UnoActions;
}

export interface RoomJoinAction extends Action<'JOIN_ROOM'> {
	participant: RoomParticipant;
}

export interface RoomLeaveAction extends Action<'LEAVE_ROOM'> {
	participant: RoomParticipant;
}

export interface NewChatAction extends Action<'NEW_CHAT'> {
	participant: RoomParticipant;

	message: string;
}

export const joinRoom = (participant: RoomParticipant): Actions => ({
	type: 'JOIN_ROOM',
	participant,
});

export const leaveRoom = (participant: RoomParticipant): Actions => ({
	type: 'LEAVE_ROOM',
	participant,
});

export const sendChat = (participant: RoomParticipant) => (message: string): Actions => ({
	type: 'NEW_CHAT',
	message,
	participant,
});

export type Actions = NewChatAction | RoomLeaveAction | RoomJoinAction | UnoAction;
