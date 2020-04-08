import { UNO } from '../../types';
import { UnoActions } from '../../actions/uno';

export default (game: UNO.Game, action: UnoActions): UNO.Game => {
	switch (action.type) {
		case 'INIT':
			throw new Error('Init has to be handled by the client or server, not common');
	}
};
