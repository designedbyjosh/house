import { io } from 'socket.io-client';

export const socket = io("https://spotify.josh.house", { path: "/ws"});