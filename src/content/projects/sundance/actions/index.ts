import { Socket } from 'dgram';
import { Dispatch } from 'react';
import { io } from 'socket.io-client';

var client: any;

export const attach = (clnt: any, dispatch: Dispatch<any>) => {

    client = clnt;

    client.on('/project/sundance/queue', (data: any) => {
        dispatch({type: "SUNDANCE_UPDATE_QUEUE", payload: data})
    })

    client.on('/project/sundance/authorised', (data: any) => {
        dispatch({type: "SUNDANCE_UPDATE_QUEUE", payload: data})
    })

    client.on('/project/sundance/canvas', (data: any) => {
        dispatch({type: "SUNDANCE_UPDATE_CANVAS", payload: data})
    })

}

export const updateCanvas = (dispatch: Dispatch<any>, canvas: any) => {
    client.emit('/project/sundance/canvas', canvas)
    dispatch({type: "SUNDANCE_UPDATE_CANVAS", payload: canvas})
}