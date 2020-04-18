import React, { ComponentType, FC } from 'react';
import io from 'socket.io-client';
import { createContext } from 'vm';

export const socket = io({
	autoConnect: true,
	reconnection: true,
});

const { Consumer: SocketConsumer, Provider: SocketProvider } = createContext(socket);
export { SocketConsumer, SocketProvider };

export const withSocket = <P extends object>(
	Component: ComponentType<P & { socket: SocketIOClient.Socket }>
): FC<Omit<P, 'socket'>> => props => (
	<Component {...({ ...props, socket } as P & { socket: SocketIOClient.Socket })} />
);
