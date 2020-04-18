import {
	AppBar,
	Avatar,
	CssBaseline,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemText,
	makeStyles,
	TextField,
	Toolbar,
	Typography,
	useTheme,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import SendIcon from '@material-ui/icons/Send';
import clsx from 'clsx';
import { ChatItem, Maybe, RoomParticipant } from 'common';
import md5 from 'md5';
import { pipe } from 'ramda';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { leaveRoom as leaveRoomAction, sendChatMessage as sendChatMessageAction } from '../actions';
import { ClientInRoom, ThunkDispatcher } from '../createStore';
import { Game } from '../games/Game';
import { withSocket } from '../socket';

const mapStateToProps = (state: ClientInRoom) => ({
	chat: state.game.chat,
	name: state.game.name,
	participants: state.game.participants,
	hasGame: state.game.hasGame,
	me: state.me,
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
	sendChatMessage(socket: SocketIOClient.Socket, message: string) {
		dispatch(sendChatMessageAction(socket, message));
	},
	leaveRoom(socket: SocketIOClient.Socket) {
		dispatch(leaveRoomAction(socket));
	},
});

const drawerWidth = 360;

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
	},
	appBar: {
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginRight: drawerWidth,
	},
	title: {
		flexGrow: 1,
	},
	hide: {
		display: 'none',
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
		justifyContent: 'flex-start',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginRight: -drawerWidth,
	},
	contentShift: {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginRight: 0,
	},
	marginLeft: {
		marginLeft: theme.spacing(2),
	},
	floatRight: {
		float: 'right',
		marginRight: theme.spacing(2),
	},
	panelParticipants: {
		flex: 0,
	},
	panelChat: {
		flex: 1,
	},
	panelSend: {
		flex: '0 0 30px',
	},
	panelSendBox: {
		display: 'flex',
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(1),
		paddingTop: theme.spacing(1),
	},
	panelSendButton: {
		flex: '0 0 30px',
	},
	panelSendInput: {
		flex: 1,
	},
	chatName: {
		margin: 0,
		padding: 0,
	},
	chatText: {
		margin: 0,
		padding: 0,
	},
	chatTextMessage: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(1),
		backgroundColor: '#eee',
		display: 'inline-block',
		borderRadius: 10,
	},
	chatTextBox: {},
	chatNameMe: {
		display: 'none',
	},
	chatTextMe: {
		textAlign: 'right',
		margin: 0,
		padding: 0,
	},
	chatTextMessageMe: {
		padding: theme.spacing(1),
		marginBottom: theme.spacing(0.5),
		borderRadius: 10,
		backgroundColor: '#ccc',
		display: 'inline-block',
	},
	chatTextBoxMe: {},
	noPadding: {
		paddingTop: 0,
		paddingBottom: 0,
	},
}));

export const getAvatarURL = (name: string) =>
	pipe(
		Maybe.map<string, string>(
			email =>
				`https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon`
		),
		Maybe.orSome(`https://www.gravatar.com/avatar/${md5(name)}?d=identicon`)
	);

export const RenderParticipant = (textClassRenderer: string) => (
	participant: RoomParticipant,
	index: number
) => (
	<ListItem key={index}>
		<Avatar src={getAvatarURL(participant.name)(participant.email)} />
		<ListItemText className={textClassRenderer}>{participant.name}</ListItemText>
	</ListItem>
);

export const RenderChatItems = (styles: ReturnType<ReturnType<typeof makeStyles>>) => (
	participants: RoomParticipant[]
) => (me: RoomParticipant) => (chatItem: ChatItem[], index: number) => (
	<ListItem key={index} className={styles.noPadding}>
		<ListItemText
			className={me.id === chatItem[0].senderID ? styles.chatTextBoxMe : styles.chatTextBox}
		>
			<Typography
				variant="h6"
				className={me.id === chatItem[0].senderID ? styles.chatNameMe : styles.chatName}
			>
				{participants.find(({ id }) => id === chatItem[0].senderID)?.name ?? ''}
			</Typography>
			{chatItem.map(({ message }) => (
				<p className={me.id === chatItem[0].senderID ? styles.chatTextMe : styles.chatText}>
					<span
						className={
							me.id === chatItem[0].senderID
								? styles.chatTextMessageMe
								: styles.chatTextMessage
						}
					>
						{message}
					</span>
				</p>
			))}
		</ListItemText>
	</ListItem>
);

const groupChatItems = (chatItems: ChatItem[]) => {
	const returnValue: ChatItem[][] = [];

	let previousItem: ChatItem[] | null = null;

	for (const item of chatItems) {
		if (previousItem === null) {
			previousItem = [item];
		} else {
			if (previousItem[0].senderID === item.senderID) {
				previousItem.push(item);
			} else {
				returnValue.push(previousItem);
				previousItem = [item];
			}
		}
	}

	if (previousItem !== null) {
		returnValue.push(previousItem);
	}

	return returnValue;
};

export const ChatInput: FunctionComponent<{
	socket: SocketIOClient.Socket;
	styles: ReturnType<ReturnType<typeof makeStyles>>;
	sendChatMessage: (socket: SocketIOClient.Socket, message: string) => void;
}> = ({ sendChatMessage, socket, styles }) => {
	const [inputText, setInputText] = useState<string>('');

	const disabled = inputText === '';

	const sendMessage = () => {
		sendChatMessage(socket, inputText);
		setInputText('');
	};

	return (
		<div className={styles.panelSendBox}>
			<TextField
				value={inputText}
				className={styles.panelSendInput}
				onChange={e => setInputText(e.target.value)}
				onKeyPress={e => {
					if (e.key === 'Enter') {
						e.preventDefault();
						if (!disabled) {
							sendMessage();
						}
					}
				}}
			/>
			<IconButton
				className={styles.panelSendButton}
				onClick={sendMessage}
				disabled={disabled}
			>
				<SendIcon />
			</IconButton>
		</div>
	);
};

const ConnectedChatInput = withSocket(
	connect(undefined, (dispatch: ThunkDispatcher) => ({
		sendChatMessage(socket: SocketIOClient.Socket, message: string) {
			dispatch(sendChatMessageAction(socket, message));
		},
	}))(ChatInput)
);

export const RoomRender: FunctionComponent<{
	chat: ChatItem[];
	socket: SocketIOClient.Socket;
	name: string;
	me: RoomParticipant;
	participants: RoomParticipant[];
	hasGame: boolean;
	sendChatMessage: (socket: SocketIOClient.Socket, message: string) => void;
	leaveRoom: (socket: SocketIOClient.Socket) => void;
}> = ({ me, chat, name, participants, hasGame, socket, sendChatMessage, leaveRoom }) => {
	const styles = useStyles();
	const theme = useTheme();
	const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(true);

	const handleDrawerOpen = () => setDrawerIsOpen(true);

	const handleDrawerClose = () => setDrawerIsOpen(false);

	const handleLeaveRoom = () => leaveRoom(socket);

	const participantRenderer = RenderParticipant(styles.marginLeft);
	const chatRenderer = RenderChatItems(styles)(participants)(me);

	return (
		<div className={styles.root}>
			<CssBaseline />
			<AppBar
				position="fixed"
				className={clsx(styles.appBar, {
					[styles.appBarShift]: drawerIsOpen,
				})}
			>
				<Toolbar>
					<Typography variant="h6" noWrap className={styles.title}>
						{name}
					</Typography>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="end"
						onClick={handleDrawerOpen}
						className={clsx(drawerIsOpen && styles.hide)}
					>
						<MenuIcon />
					</IconButton>
				</Toolbar>
			</AppBar>
			<main
				className={clsx(styles.content, {
					[styles.contentShift]: drawerIsOpen,
				})}
			>
				<Game />
			</main>
			<Drawer
				className={styles.drawer}
				variant="persistent"
				anchor="right"
				open={drawerIsOpen}
				classes={{
					paper: styles.drawerPaper,
				}}
			>
				<div>
					<div className={styles.drawerHeader}>
						<IconButton onClick={handleDrawerClose}>
							<ChevronRightIcon />
						</IconButton>
						<IconButton
							onClick={handleLeaveRoom}
							className={styles.floatRight}
							title="Leave room"
						>
							<CloseIcon />
						</IconButton>
					</div>
					<Divider />
				</div>
				<div className={styles.panelParticipants}>
					<List>{participants.map(participantRenderer)}</List>
				</div>
				<div className={styles.panelChat}>
					<Divider />
					<List>{groupChatItems(chat).map(chatRenderer)}</List>
				</div>
				<div className={styles.panelSend}>
					<Divider />
					<ConnectedChatInput styles={styles} />
				</div>
			</Drawer>
		</div>
	);
};

export default withSocket(connect(mapStateToProps, mapDispatchToProps)(RoomRender));
