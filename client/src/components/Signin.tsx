import { Button, Grid, makeStyles, TextField, FormGroup } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions';
import { withSocket } from '../socket';

const useStyles = makeStyles(theme => ({
	margin: {
		margin: theme.spacing(2),
	},
	marginBottom: {
		marginBottom: theme.spacing(2),
	},
}));

const mapDispatch = {
	login,
};

export const Signin: FunctionComponent<{
	socket: SocketIOClient.Socket;
	login: (socket: SocketIOClient.Socket, name: string, email: string) => void;
}> = ({ login: loginUser, socket }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [disabled, setDisabled] = useState(false);

	const classes = useStyles();

	const signin = () => {
		setDisabled(true);

		loginUser(socket, name, email);
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
			<FormGroup className={classes.margin}>
				<TextField
					onChange={e => setName(e.target.value)}
					value={name}
					required={true}
					label="Name"
					variant="outlined"
					className={classes.marginBottom}
				/>
				<TextField
					onChange={e => setEmail(e.target.value)}
					value={email}
					label="Email (optional)"
					variant="outlined"
					title="Used for avatars"
				/>
				<Button
					type="submit"
					className={classes.margin}
					color="primary"
					variant="contained"
					disabled={disabled}
					onClick={signin}
				>
					Submit
				</Button>
			</FormGroup>
		</Grid>
	);
};

export default withSocket(connect(undefined, mapDispatch)(Signin));
