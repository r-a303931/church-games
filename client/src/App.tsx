import React, { FunctionComponent } from 'react';
import './App.css';
import { ClientState, ClientStateType } from './createStore';
import { connect } from 'react-redux';
import Signin from './components/Signin';

const App: FunctionComponent<{ state: ClientStateType }> = ({ state }) => {
	return state === 'UNLOADED' ? <Signin /> : null;
};

export default connect(({ state }: ClientState) => ({
	state,
}))(App);
