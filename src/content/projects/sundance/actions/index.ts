import { Socket } from 'dgram';
import { Dispatch } from 'react';
import { RGBColor } from 'react-color';
import { io } from 'socket.io-client';

var client: any;

export const attach = (clnt: any, dispatch: Dispatch<any>) => {

    client = clnt;

    client.on('/project/sundance/queue', (data: any) => {
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

export const updateRiskConsent = (dispatch: Dispatch<any>, consent: boolean) => {
    dispatch({type: "UPDATE_SUNDANCE_RISK_CONSENT", payload: consent})
}

export const updateActiveColor = (dispatch: Dispatch<any>, color: RGBColor) => {
    dispatch({type: "UPDATE_SUNDANCE_ACTIVE_COLOR", payload: color})
}