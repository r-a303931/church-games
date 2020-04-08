import { Maybe } from 'common';
import React, { FunctionComponent } from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import './App.css';
import RoomList from './components/RoomList';
import Signin from './components/Signin';
import { ClientState, ClientStateType } from './createStore';

const App: FunctionComponent<{ state: ClientStateType }> = state => {
	return state.state === 'UNLOADED' ? (
		<Signin />
	) : state.state === 'LOADED_MAIN' ? (
		<RoomList />
	) : null;
};

export default process.env.NODE_ENV === 'development'
	? hot(module)(
			connect(({ state }: ClientState = { state: 'UNLOADED', error: Maybe.none() }) => ({
				state,
			}))(App)
	  )
	: connect(({ state }: ClientState = { state: 'UNLOADED', error: Maybe.none() }) => ({
			state,
	  }))(App);
