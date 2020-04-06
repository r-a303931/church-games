import { ServerState } from '../createStore';
import { ServerActions } from '../actions';

export default (state: ServerState | undefined, action: ServerActions) => state!;
