import { Socket } from 'dgram';
import { Dispatch } from 'react';
import { io } from 'socket.io-client';
import { attach } from '../../content/projects/sundance/actions';

export const configure = (dispatch: Dispatch<any>, server: string) => {
    
    //@ts-ignore
    const client = io(server, { transport: ['websocket'] });

    client.on('connect', () => {
        dispatch({type: "UPDATE_NETWORKING_STATUS", payload: true})
    })

    client.on('disconnect', () => {
        console.log('disconnecting')
        dispatch({type: "UPDATE_NETWORKING_STATUS", payload: false})
    })

    attach(client, dispatch);
}