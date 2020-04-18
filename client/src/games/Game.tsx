import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { makeStyles, Typography } from '@material-ui/core';
import { ClientInRoom } from '../createStore';
import { Room, RoomParticipant } from 'common';
import { withSocket } from '../socket';
import Lobby from './Lobby';

const mapGameStateToProps = (state: ClientInRoom) => ({
	room: state.game,
});

const useGameStyles = makeStyles(theme => ({
	base: {
		width: '100%',
		height: 'calc(100% - 64px)',
	},
}));

export const Game: FunctionComponent<{
	room: Room;
}> = ({ room }) => {
	const styles = useGameStyles();

	return <div className={styles.base}>{!room.hasGame ? <Lobby /> : null}</div>;
};

export default connect(mapGameStateToProps)(Game);
