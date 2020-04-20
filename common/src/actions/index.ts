import { Action } from 'redux';
import { UnoActions } from './uno';
import { GameType, RoomParticipant } from '../types';

export interface SelfUnoAction extends Action<'GAME_ACTION'> {
	gameType: GameType.UNO;

	gameAction: UnoActions;
}

export type SelfRoomJoinAction = Action<'JOIN_ROOM'>;

export type SelfRoomLeaveAction = Action<'LEAVE_ROOM'>;

export type SelfReadyUpAction = Action<'READY_UP'>;

export type SelfUnReadyUpAction = Action<'UNREADY_UP'>;

export interface SelfNewChatAction extends Action<'NEW_CHAT'> {
	message: string;
}

export interface SelectGameTypeAction extends Action<'SELECT_GAME_TYPE'> {
	gameType: GameType;
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

export type OtherPlayerAction<T extends SelfActions> = T & { participant: RoomParticipant };

export type Actions = OtherPlayerAction<SelfActions> | SelectGameTypeAction;

export type SelfActions =
	| SelfNewChatAction
	| SelfRoomLeaveAction
	| SelfRoomJoinAction
	| SelfUnoAction
	| SelfReadyUpAction
	| SelfUnReadyUpAction;
