import React from 'react';
import { App } from './App';
import { shallow } from 'enzyme';

it('renders `unloaded` without crashing', () => {
	shallow(<App state="UNLOADED" />);
});

it('renders `loaded main` without crashing', () => {
	shallow(<App state="LOADED_MAIN" />);
});

it('renders `in game` without crashing', () => {
	shallow(<App state="IN_GAME" />);
});
