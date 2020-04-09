import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import createStore from './createStore';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'typeface-roboto';

const render = (Component: FunctionComponent<{}>) => {
	ReactDOM.render(
		<React.StrictMode>
			<Provider store={createStore()}>
				<Component />
			</Provider>
		</React.StrictMode>,
		document.getElementById('root')
	);
};

render(App);

if (module.hot) {
	module.hot.accept('./App', () => {
		const NextApp = require('./App').default;

		render(NextApp);
	});
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
