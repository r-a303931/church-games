import { Action } from 'redux';
import { UNO } from '../types';

export interface InitAction extends Action<'INIT'> {
	playerIDs: string[];
}

export interface InitializedAction extends Action<'INIT_DONE'> {
	readyGame: UNO.Game;
}

export type UnoActions = InitializedAction | InitAction;
