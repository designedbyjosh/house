import react, { useEffect, useRef, useState } from "react";
import matter from 'gray-matter';
import Reader from "../../components/article/reader";
import Head from '../../components/head';
import { Layer, Rect, Stage } from "react-konva";
import Canvas from "../../components/canvas";
import { Dispatch } from 'react';
import { RGBColor } from 'react-color';
import { io } from 'socket.io-client';

var client: any;

export 

/**
 * Renders the Sundance project
 * 
 * @author Josh <code@josh.house> 
 */
const Sundance = ({ props }) => {

    const [canvas, setCanvas] = useState();

    const attach = (server: string) => {

        //@ts-ignore
        const client = io(server, { transport: ['websocket'] });
    
        client.on('/project/sundance/queue', (data: any) => {
            // dispatch({type: "SUNDANCE_UPDATE_QUEUE", payload: data})
        })
    
        client.on('/project/sundance/canvas', (data: any) => {
           setCanvas(data)
        })

        client.on('connect', () => {
            console.log("connected")
        })
    
        client.on('disconnect', () => {
            console.log('disconnecting')
        })
    
    }

    useEffect(() => {
        attach("localhost:8999")
    }, [])

    return (<>
        Project Sundance is opening my wall up to be drawn on by anybody.

        {canvas && <Canvas canvas={canvas} />}
    </>)
};

export default Sundance;
