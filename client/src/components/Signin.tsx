import { Button, Grid, makeStyles, TextField, FormGroup } from '@material-ui/core';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { login } from '../actions';
import { withSocket, FullConvertedProps } from '../socket';

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

interface SigninProps {
	login: (socket: SocketIOClient.Socket, name: string, email: string) => void;
}

export const Signin: FunctionComponent<FullConvertedProps<SigninProps, 'login'>> = ({
	login: loginUser,
}) => {
	const [name, setName] = useState(() => window.localStorage.getItem('name') ?? '');
	const [email, setEmail] = useState(() => window.localStorage.getItem('email') ?? '');
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		window.localStorage.setItem('name', name);
	}, [name]);
	useEffect(() => {
		window.localStorage.setItem('email', email);
	}, [email]);

	const classes = useStyles();

	const signin = () => {
		setDisabled(true);

		loginUser(name, email);
	};

	const nameBoxIsEmpty = name.trim() === '';
	const functionallyDisabled = disabled || nameBoxIsEmpty;

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
					disabled={functionallyDisabled}
					onClick={signin}
				>
					Submit
				</Button>
			</FormGroup>
		</Grid>
	);
};

export default connect(undefined, mapDispatch)(withSocket(Signin, 'login'));
