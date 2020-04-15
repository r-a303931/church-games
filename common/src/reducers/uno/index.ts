import { UNO } from '../../types';
import { UnoActions, InitAction, InitializedAction } from '../../actions/uno';

export type FullUnoReducer = (game: UNO.Game, action: UnoActions) => UNO.Game;

export default (
	game: UNO.Game,
	action: Exclude<UnoActions, InitAction | InitializedAction>
): UNO.Game => {
	return game;
	// switch (action.type) {
	// 	case 'INIT':
	// 		throw new Error('Init has to be handled by the client or server, not common');
	// }
};
