import { UnoGameRoom } from 'common';
import { UnoActions } from 'common/dist/actions/uno';
import { Dispatcher } from '../syncStateMiddleware';

export default (dispatcher: Dispatcher) => (room: UnoGameRoom, action: UnoActions) => {};
