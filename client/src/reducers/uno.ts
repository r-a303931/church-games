import { UNO, unoReducer } from 'common';
import { UnoActions } from 'common/dist/actions/uno';

export default (game: UNO.Game, action: UnoActions): UNO.Game => {
	switch (action.type) {
		// Don't handle, as it should only be handled by the server
		case 'INIT':
			throw new Error('Received `INIT` action on client');

		case 'INIT_DONE':
			return action.readyGame;

		default:
			return unoReducer(game, action);
	}
};
