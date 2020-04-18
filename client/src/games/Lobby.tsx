import { RoomParticipant, WaitingRoom, GameType, Maybe } from 'common';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { ClientInRoom, ThunkDispatcher } from '../createStore';
import { withSocket, FullConvertedProps } from '../socket';
import {
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	makeStyles,
} from '@material-ui/core';
import { selectGame as selectGameAction } from '../actions';

const useStyles = makeStyles(theme => ({}));

const mapStateToProps = (state: ClientInRoom) => ({
	me: state.me,
	room: state.game as WaitingRoom,
});

interface LobbyProps {
	me: RoomParticipant;
	room: WaitingRoom;
	selectGame: (socket: SocketIOClient.Socket, game: GameType) => void;
}

export const Lobby: FunctionComponent<FullConvertedProps<LobbyProps, 'selectGame'>> = ({
	me,
	room,
	selectGame,
}) => {
	const styles = useStyles();

	return (
		<div>
			<FormControl component="fieldset">
				<FormLabel component="legend">Select game</FormLabel>
				<RadioGroup
					aria-label="game"
					value={Maybe.join(room.gameSelection)}
					name="room-selection"
					onChange={e => selectGame(parseInt(e.target.value, 10) as GameType)}
				>
					<FormControlLabel value={GameType.UNO} control={<Radio />} label="Uno" />
				</RadioGroup>
			</FormControl>
		</div>
	);
};

export default connect(mapStateToProps, (dispatch: ThunkDispatcher) => ({
	selectGame(socket: SocketIOClient.Socket, gameType: GameType) {
		dispatch(selectGameAction(socket, gameType));
	},
}))(withSocket(Lobby, 'selectGame'));
