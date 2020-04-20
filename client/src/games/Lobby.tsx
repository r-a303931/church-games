import { RoomParticipant, WaitingRoom, GameType, Maybe, unolib } from 'common';
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
	Button,
} from '@material-ui/core';
import {
	selectGame as selectGameAction,
	readyUp as readyUpAction,
	unreadyUp as unreadyUpAction,
	startUnoGame as startUnoGameAction,
} from '../actions';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
	root: {
		padding: 20,
	},
	marginRight2: {
		marginRight: theme.spacing(2),
	},
}));

const mapStateToProps = (state: ClientInRoom) => ({
	me: state.me,
	room: state.game as WaitingRoom,
});

interface LobbyProps {
	me: RoomParticipant;
	room: WaitingRoom;
	selectGame: (socket: SocketIOClient.Socket, game: GameType) => void;
	readyUp: (socket: SocketIOClient.Socket) => void;
	unreadyUp: (socket: SocketIOClient.Socket) => void;
	startUnoGame: (socket: SocketIOClient.Socket, playerIDs: string[]) => void;
}

export const Lobby: FunctionComponent<FullConvertedProps<
	LobbyProps,
	'selectGame' | 'readyUp' | 'unreadyUp' | 'startUnoGame'
>> = ({
	me,
	room: { gameSelection, participants, playerIDs },
	selectGame,
	readyUp,
	unreadyUp,
	startUnoGame,
}) => {
	const styles = useStyles();

	const amIReadiedUp = playerIDs.includes(me.id);

	const handleJoinOrLeave = () => {
		if (amIReadiedUp) {
			unreadyUp();
		} else {
			readyUp();
		}
	};

	const handleStartGame = () => {
		if (Maybe.isNone(gameSelection)) {
			return;
		}

		const selection = Maybe.join(gameSelection);

		if (selection === GameType.UNO) {
			startUnoGame(playerIDs);
		}
	};

	return (
		<div className={styles.root}>
			<FormControl component="fieldset">
				<FormLabel component="legend">Select game</FormLabel>
				<RadioGroup
					aria-label="game"
					value={Maybe.join(gameSelection)}
					name="room-selection"
					onChange={e => selectGame(parseInt(e.target.value, 10) as GameType)}
				>
					<FormControlLabel
						disabled={!unolib.isEnoughPlayers(playerIDs.length)}
						value={GameType.UNO}
						control={<Radio />}
						label="Uno"
						title={
							!unolib.isEnoughPlayers(playerIDs.length)
								? 'Not enough players for Uno'
								: undefined
						}
					/>
				</RadioGroup>
			</FormControl>
			<Typography variant="h6">Ready players</Typography>
			<ul>
				{playerIDs.map((playerID, index) => (
					<li key={index}>
						{participants.find(({ id }) => playerID === id)?.name ?? '<invalid player>'}
					</li>
				))}
			</ul>
			<Button variant="contained" onClick={handleJoinOrLeave} className={styles.marginRight2}>
				{amIReadiedUp ? 'Not ready' : 'Ready up'}
			</Button>
			<Button
				variant="contained"
				onClick={handleStartGame}
				disabled={Maybe.isNone(gameSelection)}
			>
				Start game
			</Button>
		</div>
	);
};

export default connect(mapStateToProps, (dispatch: ThunkDispatcher) => ({
	selectGame(socket: SocketIOClient.Socket, gameType: GameType) {
		dispatch(selectGameAction(socket, gameType));
	},
	readyUp(socket: SocketIOClient.Socket) {
		dispatch(readyUpAction(socket));
	},
	unreadyUp(socket: SocketIOClient.Socket) {
		dispatch(unreadyUpAction(socket));
	},
	startUnoGame(socket: SocketIOClient.Socket, playerIDs: string[]) {
		dispatch(startUnoGameAction(socket, playerIDs));
	},
}))(withSocket(Lobby, 'selectGame', 'readyUp', 'unreadyUp', 'startUnoGame'));
