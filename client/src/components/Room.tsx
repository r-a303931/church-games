import React, { FunctionComponent } from 'react';
import { Room } from 'common';
import { Game } from '../games/Game';
import { connect } from 'react-redux';
import { ClientInRoom } from '../createStore';

const mapStateToProps = (state: ClientInRoom) => ({
	room: state.game,
});

export const RoomRender: FunctionComponent<{
	room: Room;
}> = ({ room }) => {
	return (
		<>
			<Game />
			{/* is where we do room stuff */}
			<div>{room.name}</div>
		</>
	);
};

export default connect(mapStateToProps)(RoomRender);
