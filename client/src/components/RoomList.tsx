import {
	Avatar,
	Backdrop,
	Button,
	Fab,
	Fade,
	FormControl,
	Grid,
	List,
	ListItem,
	ListItemAvatar,
	ListItemSecondaryAction,
	ListItemText,
	makeStyles,
	Modal,
	TextField,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { GameType, Maybe, MaybeObj, SmallRoom } from 'common';
import { pipe } from 'ramda';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { createRoom as createRoomAction, joinRoom as joinRoomAction } from '../actions';
import { ClientLoaded } from '../createStore';
import { withSocket } from '../socket';
import unoIcon from './gameicons/uno.png';

interface PasswordInputShownState {
	showingInput: true;
	input: string;
	targetRoomID: string;
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
	error: state.error,
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
	noRoomsTitle: {
		color: '#888',
		fontWeight: 'normal',
		fontSize: 40,
	},
}));

const gameNames = {
	[GameType.UNO]: 'Uno',
};

const gameIconURLs = {
	[GameType.UNO]: unoIcon,
};

export const ShowRoom: FunctionComponent<{
	room: SmallRoom;
	onJoinClick: (room: SmallRoom) => void;
}> = ({ room, onJoinClick }) => (
	<ListItem>
		{room.currentGame.hasValue ? (
			<ListItemAvatar>
				<Avatar src={gameIconURLs[room.currentGame.value]} />
			</ListItemAvatar>
		) : null}
		<ListItemText
			inset={!room.currentGame.hasValue}
			primary={room.name}
			secondary={`${pipe(
				Maybe.map<GameType, string>(name => `Currently playing: ${gameNames[name]} :: `),
				Maybe.orSome('')
			)(room.currentGame)}${room.participantCount} player${
				room.participantCount !== 1 ? 's' : ''
			}${room.needsPassword ? ' (Requires password)' : ''}`}
		/>
		<ListItemSecondaryAction>
			<Button variant="contained" aria-label="join" onClick={() => onJoinClick(room)}>
				Join
			</Button>
		</ListItemSecondaryAction>
	</ListItem>
);

// export const NewRoomDialogue: FunctionComponent<{
// 	showing: boolean;
// 	onClose: () => void;
// }> = ({ showing, onClose }) => {
// 	const [passwordInput, setPasswordInput] = useState<string>('');
// 	const [roomNameInput, setRoomNameInput] = useState<string>('');

// 	return null;
// };

// export const JoinRoomDialogue: FunctionComponent<{
// 	showing: boolean;
// 	onClose: () => void;
// 	room: SmallRoom;
// }> = ({ showing, onClose, room }) => {
// 	const [passwordInput, setPasswordInput] = useState<string>('');

// 	if (!showing && passwordInput !== '') {
// 		setPasswordInput('');
// 	}

// 	return null;
// };

export const RoomList: FunctionComponent<{
	rooms: SmallRoom[];
	socket: SocketIOClient.Socket;
	error: MaybeObj<string>;
	createRoom: (socket: SocketIOClient.Socket, name: string, password: string) => void;
	joinRoom: (socket: SocketIOClient.Socket, id: string, password: string) => void;
}> = ({ socket, rooms, createRoom, joinRoom, error }) => {
	const styles = useStyles();

	const [passwordInput, setPasswordInput] = useState<PasswordInputState>({ showingInput: false });
	const [newRoomInput, setNewRoomInput] = useState<NewRoomInputState>({ showingInput: false });

	const createRoomClickHandler = () => {
		if (!newRoomInput.showingInput) {
			return;
		}

		createRoom(socket, newRoomInput.name, newRoomInput.password);
	};

	const joinRoomClickHandler = () => {
		if (!passwordInput.showingInput) {
			return;
		}

		joinRoom(socket, passwordInput.targetRoomID, passwordInput.input);
	};

	return (
		<>
			{rooms.length === 0 ? (
				<div className={styles.modal} style={{ minHeight: '100vh' }}>
					<h2 className={styles.noRoomsTitle}>
						<i>There are no rooms. Create one?</i>
					</h2>
				</div>
			) : (
				<List>
					{rooms.map((room, index) => (
						<ShowRoom room={room} onJoinClick={() => void 0} key={index} />
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
									onClick={createRoomClickHandler}
								>
									Submit
								</Button>
							</FormControl>
						</Grid>
					</div>
				</Fade>
			</Modal>
			<Modal
				className={styles.modal}
				open={passwordInput.showingInput}
				onClose={() => setPasswordInput({ showingInput: false })}
				closeAfterTransition={true}
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={passwordInput.showingInput}>
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
										setPasswordInput({
											showingInput: true,
											input: e.target.value,
											targetRoomID: passwordInput.showingInput
												? passwordInput.targetRoomID
												: '',
										})
									}
									value={passwordInput.showingInput ? passwordInput.input : ''}
									required={true}
									label="Room Password"
									variant="outlined"
									className={styles.marginBottom}
									type="password"
									error={Maybe.isSome(error)}
									helperText={Maybe.orSome('')(error)}
								/>
								<Button
									className={styles.margin}
									color="primary"
									variant="contained"
									onClick={joinRoomClickHandler}
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
