import {
	Fab,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
	Button,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { GameType, Maybe, SmallRoom } from 'common';
import { pipe } from 'ramda';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { joinRoom as joinRoomAction } from '../actions';
import { ClientLoaded } from '../createStore';

interface PasswordInputShownState {
	showingInput: true;
	input: string;
}

interface PasswordInputNotShownState {
	showingInput: false;
}

type PasswordInputState = PasswordInputNotShownState | PasswordInputShownState;

interface NewRoomInputShownState {
	showingInput: true;
	name: string;
	password: string;
}

interface NewRoomInputNotShownState {
	showingInput: false;
}

type NewRoomInputState = NewRoomInputShownState | NewRoomInputNotShownState;

const mapState = (state: ClientLoaded) => ({
	rooms: state.rooms,
	socket: state.socket,
});

const dispatchProps = {
	createRoom: (name: string, password: string) => {},
	joinRoom: joinRoomAction,
};

const useStyles = makeStyles(theme => ({
	bottomRight: {
		position: 'fixed',
		right: theme.spacing(2),
		bottom: theme.spacing(2),
	},
	modal: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	extendedIcon: {
		marginRight: theme.spacing(1),
	},
}));

const gameNames = {
	[GameType.UNO]: 'Uno',
};

const RoomList: FunctionComponent<{
	rooms: SmallRoom[];
	socket: SocketIOClient.Socket;
	createRoom: (name: string, password: string) => void;
	joinRoom: (socket: SocketIOClient.Socket, id: string, password: string) => void;
}> = ({ socket, rooms, createRoom, joinRoom }) => {
	const styles = useStyles();

	const [passwordInput, setPasswordInput] = useState<PasswordInputState>({ showingInput: false });
	const [newRoomInput, setNewRoomInput] = useState<NewRoomInputState>({ showingInput: false });

	return (
		<>
			{rooms.length === 0 ? (
				<div>There are no rooms</div>
			) : (
				<List>
					{rooms.map((room, index) => (
						<ListItem key={index}>
							<ListItemText
								primary={room.name}
								secondary={`${pipe(
									Maybe.map<GameType, string>(
										name => `Currently playing: ${gameNames[name]} :: `
									),
									Maybe.orSome('')
								)}${room.participantCount} player${
									room.participantCount !== 1 ? 's' : ''
								}${room.needsPassword ? ' (Requires password)' : ''}`}
							/>
							<ListItemSecondaryAction>
								<Button
									aria-label="join"
									onClick={() =>
										room.needsPassword ? null : joinRoom(socket, room.id, '')
									}
								>
									Join
								</Button>
							</ListItemSecondaryAction>
						</ListItem>
					))}
				</List>
			)}
			<Fab color="primary" className={styles.bottomRight} variant="extended" size="medium">
				<AddIcon className={styles.extendedIcon} />
				Add Room
			</Fab>
		</>
	);
};

export default connect(mapState, dispatchProps)(RoomList);
