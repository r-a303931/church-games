import {
	Backdrop,
	Button,
	Fab,
	Fade,
	FormControl,
	Grid,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
	Modal,
	TextField,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { GameType, Maybe, SmallRoom } from 'common';
import { pipe } from 'ramda';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { createRoom as createRoomAction, joinRoom as joinRoomAction } from '../actions';
import { withSocket } from '../socket';
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
});

const dispatchProps = {
	createRoom: createRoomAction,
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
	paper: {
		backgroundColor: theme.palette.background.paper,
		border: '2px solid #000',
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
	},
	margin: {
		margin: theme.spacing(2),
	},
	marginBottom: {
		marginBottom: theme.spacing(2),
	},
}));

const gameNames = {
	[GameType.UNO]: 'Uno',
};

const RoomList: FunctionComponent<{
	rooms: SmallRoom[];
	socket: SocketIOClient.Socket;
	createRoom: (socket: SocketIOClient.Socket, name: string, password: string) => void;
	joinRoom: (socket: SocketIOClient.Socket, id: string, password: string) => void;
}> = ({ socket, rooms, createRoom, joinRoom }) => {
	const styles = useStyles();

	const [passwordInput, setPasswordInput] = useState<PasswordInputState>({ showingInput: false });
	const [newRoomInput, setNewRoomInput] = useState<NewRoomInputState>({ showingInput: false });
	const [disabled, setDisabled] = useState<boolean>(false);

	const createRoomClickHandler = () => {
		if (!newRoomInput.showingInput) {
			return;
		}

		createRoom(socket, newRoomInput.name, newRoomInput.password);
	};

	return (
		<>
			{rooms.length === 0 ? (
				<div>Create a room?</div>
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
								)(room.currentGame)}${room.participantCount} player${
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
			<Fab
				color="primary"
				className={styles.bottomRight}
				variant="extended"
				onClick={() => {
					setNewRoomInput({ showingInput: true, name: '', password: '' });
				}}
			>
				<AddIcon className={styles.extendedIcon} />
				Add Room
			</Fab>
			<Modal
				className={styles.modal}
				open={newRoomInput.showingInput}
				onClose={() => setNewRoomInput({ showingInput: false })}
				closeAfterTransition={true}
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={newRoomInput.showingInput}>
					<div className={styles.paper}>
						<Grid
							container={true}
							spacing={0}
							direction="column"
							alignItems="center"
							justify="center"
						>
							<FormControl className={styles.margin}>
								<TextField
									onChange={e =>
										setNewRoomInput({
											showingInput: true,
											name: e.target.value,
											password: newRoomInput.showingInput
												? newRoomInput.password
												: '',
										})
									}
									value={newRoomInput.showingInput ? newRoomInput.name : ''}
									required={true}
									label="Room Name"
									variant="outlined"
									className={styles.marginBottom}
								/>
								<TextField
									onChange={e =>
										setNewRoomInput({
											showingInput: true,
											password: e.target.value,
											name: newRoomInput.showingInput
												? newRoomInput.name
												: '',
										})
									}
									value={newRoomInput.showingInput ? newRoomInput.password : ''}
									label="Password (optional)"
									variant="outlined"
								/>
								<Button
									className={styles.margin}
									color="primary"
									variant="contained"
									disabled={disabled}
									onClick={createRoomClickHandler}
								>
									Submit
								</Button>
							</FormControl>
						</Grid>
					</div>
				</Fade>
			</Modal>
		</>
	);
};

export default withSocket(connect(mapState, dispatchProps)(RoomList));
