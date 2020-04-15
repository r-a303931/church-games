import { ChatItem, RoomParticipant } from 'common';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { sendChatMessage as sendChatMessageAction } from '../actions';
import { ClientInRoom, ThunkDispatcher } from '../createStore';
import { Game } from '../games/Game';
import { withSocket } from '../socket';

const mapStateToProps = (state: ClientInRoom) => ({
	chat: state.game.chat,
	name: state.game.name,
	participants: state.game.participants,
	hasGame: state.game.hasGame,
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
	sendChatMessage(socket: SocketIOClient.Socket, message: string) {
		dispatch(sendChatMessageAction(socket, message));
	},
});

export const RoomRender: FunctionComponent<{
	chat: ChatItem[];
	socket: SocketIOClient.Socket;
	name: string;
	participants: RoomParticipant[];
	hasGame: boolean;
	sendChatMessage: (socket: SocketIOClient.Socket, message: string) => void;
}> = ({ chat, name, participants, hasGame, socket, sendChatMessage }) => {
	return (
		<>
			<div>{name}</div>
			{/* is where we do room stuff */}
			<Game />
		</>
	);
};

export default withSocket(connect(mapStateToProps, mapDispatchToProps)(RoomRender));
