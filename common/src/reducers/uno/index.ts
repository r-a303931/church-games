import { UNO } from '../../types';
import { UnoActions, InitAction, InitializedAction } from '../../actions/uno';

declare function UnoReducer(game: undefined, action: InitAction | InitializedAction): UNO.Game;
declare function UnoReducer(
	game: UNO.Game,
	action: Exclude<UnoActions, InitAction | InitializedAction>
): UNO.Game;

export type FullUnoReducer = typeof UnoReducer;

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
