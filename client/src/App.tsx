import React, { FunctionComponent } from 'react';
import './App.css';
import { ClientState, ClientStateType } from './createStore';
import { connect } from 'react-redux';
import Signin from './components/Signin';
import RoomList from './components/RoomList';
import { socket } from './socket';
import { Maybe } from 'common';
import { hot } from 'react-hot-loader';

const App: FunctionComponent<{ state: ClientStateType }> = state => {
	return state.state === 'UNLOADED' ? (
		<Signin />
	) : state.state === 'LOADED_MAIN' ? (
		<RoomList />
	) : null;
};

export default process.env.NODE_ENV === 'development'
	? hot(module)(
			connect(
				({ state }: ClientState = { state: 'UNLOADED', socket, error: Maybe.none() }) => ({
					state,
				})
			)(App)
	  )
	: connect(({ state }: ClientState = { state: 'UNLOADED', socket, error: Maybe.none() }) => ({
			state,
	  }))(App);
