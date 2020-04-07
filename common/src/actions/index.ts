import { Action } from 'redux';
import { UnoActions } from './uno';
import { GameType } from '../types';

interface UnoAction extends Action<'GAME_ACTION'> {
	gameType: GameType;

	gameAction: UnoActions;
}

export type Actions = UnoAction;
