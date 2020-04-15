import {
	Avatar,
	AppBar,
	CssBaseline,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemText,
	makeStyles,
	Toolbar,
	Typography,
	useTheme,
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { ChatItem, RoomParticipant, MaybeObj, Maybe } from 'common';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { sendChatMessage as sendChatMessageAction } from '../actions';
import { ClientInRoom, ThunkDispatcher } from '../createStore';
import { Game } from '../games/Game';
import { withSocket } from '../socket';
import { pipe } from 'ramda';
import md5 from 'md5';

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

export const RoomRender: FunctionComponent<{
	chat: ChatItem[];
	socket: SocketIOClient.Socket;
	name: string;
	participants: RoomParticipant[];
	hasGame: boolean;
	sendChatMessage: (socket: SocketIOClient.Socket, message: string) => void;
}> = ({ chat, name, participants, hasGame, socket, sendChatMessage }) => {
	const styles = useStyles();
	const theme = useTheme();
	const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(true);

	const handleDrawerOpen = () => setDrawerIsOpen(true);

	const handleDrawerClose = () => setDrawerIsOpen(false);

	const participantRenderer = RenderParticipant(styles.marginLeft);

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
				<div className={styles.drawerHeader}>
					<IconButton onClick={handleDrawerClose}>
						<ChevronRightIcon />
					</IconButton>
				</div>
				<Divider />
				<List>{participants.map(participantRenderer)}</List>
				<Divider />
			</Drawer>
		</div>
	);
};

export default withSocket(connect(mapStateToProps, mapDispatchToProps)(RoomRender));
