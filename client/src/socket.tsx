import React, { ComponentType, FC } from 'react';
import io from 'socket.io-client';
import { createContext } from 'vm';

export const socket = io({
	autoConnect: true,
	reconnection: true,
});

const { Consumer: SocketConsumer, Provider: SocketProvider } = createContext(socket);
export { SocketConsumer, SocketProvider };

// A more expressive socket provider/injector/enhancer

type SocketFunction<T, P extends keyof T> = T[P] extends (
	socket: SocketIOClient.Socket,
	...other: any[]
) => void
	? P
	: never;

type CurriedSocketFunctions<F> = F extends (
	socket: SocketIOClient.Socket,
	...other: infer U
) => void
	? (...args: U) => void
	: F;

type ConvertedProps<P extends object, K extends keyof P> = {
	[K2 in K]: CurriedSocketFunctions<P[K2]>;
};

export type FullConvertedProps<P extends object, K extends keyof P> = ConvertedProps<P, K> &
	Omit<P, K> & { socket: SocketIOClient.Socket };

export const withSocket = <P extends object, K extends keyof P>(
	Component: ComponentType<FullConvertedProps<P, K>>,
	...names: SocketFunction<P, K>[]
): FC<Omit<P, 'socket'>> => props => {
	const targetProps: FullConvertedProps<P, K> = { socket } as FullConvertedProps<P, K>;

	for (const key in props) {
		if (props.hasOwnProperty(key)) {
			if (!names.includes((key as any) as SocketFunction<P, K>)) {
				// @ts-ignore
				targetProps[key] = props[key];
			} else {
				// @ts-ignore
				targetProps[key] = (...args) => props[key](socket, ...args);
			}
		}
	}

	return <Component {...targetProps} />;
};
