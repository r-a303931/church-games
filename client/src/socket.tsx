import React, { FunctionComponent } from 'react';
import io from 'socket.io-client';
import { createContext } from 'vm';

export const socket = io({
	autoConnect: true,
	reconnection: true,
});

const { Consumer: SocketConsumer, Provider: SocketProvider } = createContext(socket);
export { SocketConsumer, SocketProvider };

export const withSocket = <T, _>(
	Component: FunctionComponent<T & { socket: SocketIOClient.Socket }>
): FunctionComponent<Exclude<T, 'socket'>> => (props: T) => (
	<Component {...props} socket={socket} />
);
