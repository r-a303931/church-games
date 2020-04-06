import { Button, FormControl, Grid, makeStyles, TextField } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { ClientActions, login } from '../actions';
import { ClientState } from '../createStore';

const useStyles = makeStyles(theme => ({
	margin: {
		margin: theme.spacing(3),
	},
	centered: {},
}));

export const Signin: FunctionComponent<{
	socket: SocketIOClient.Socket;
	dispatch: ThunkDispatch<ClientState, undefined, ClientActions>;
}> = ({ dispatch, socket }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [disabled, setDisabled] = useState(false);

	const classes = useStyles();

	const signin = () => {
		setDisabled(true);

		dispatch(login(socket, name, email));
	};

	return (
		<Grid
			container={true}
			spacing={0}
			direction="column"
			alignItems="center"
			justify="center"
			style={{ minHeight: '100vh' }}
		>
			<FormControl className={classes.margin}>
				<TextField
					onChange={e => setName(e.target.value)}
					value={name}
					required={true}
					label="Name"
				/>
				<TextField
					onChange={e => setEmail(e.target.value)}
					value={email}
					label="Email (optional)"
				/>
				<Button
					className={classes.margin}
					color="primary"
					variant="contained"
					disabled={disabled}
					onClick={signin}
				>
					Submit
				</Button>
			</FormControl>
		</Grid>
	);
};

export default connect(
	({ socket }: ClientState) => ({ socket }),
	dispatch => ({ dispatch })
)(Signin);
