import { Socket } from 'dgram';
import { Dispatch } from 'react';
import { io } from 'socket.io-client';

export const configure = (dispatch: Dispatch<any>, server: string) => {
    
    //@ts-ignore
    const client = io(server, { transport: ['websocket'] });

    client.on('connect', () => {
        console.log('connecting')
        dispatch({type: "UPDATE_NETWORKING_STATUS", payload: true})
    })

    client.on('disconnect', () => {
        console.log('disconnecting')
        dispatch({type: "UPDATE_NETWORKING_STATUS", payload: false})
    })
}