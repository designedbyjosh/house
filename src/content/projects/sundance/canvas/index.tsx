
import React from 'react';
import { motion } from 'framer-motion';
import './canvas.scss';
import { updateCanvas } from '../actions';
import { useDispatch } from 'react-redux';

interface PixelType {
    r: number,
    g: number,
    b: number
}

const Pixel: React.FC<any> = ({x, y, pixel, onClick}) => {

    return (<div onMouseDown={onClick} onMouseEnter={(e) => e.buttons === 1 && onClick()} className="pixel" style={{backgroundColor: `rgb(${pixel.r},${pixel.b},${pixel.g})`}} key={`${x}_${y}_pixel`} />)

}

const Canvas: React.FC<any> = ({canvas}) => {


    const dispatch = useDispatch();

    const updatePixel = (x: number, y: number, pixel: PixelType) => {
        let current = JSON.parse(JSON.stringify(canvas));
        let row = current[y];
        row[x] = pixel;
        current[y] = row;
        updateCanvas(dispatch, current);
    }

    console.log(canvas)

    let rendered = canvas && canvas.map((row: any, y: number) => {
        return <div className="canvas_row">
            {row.map((pixel: any, x: number) => <Pixel onClick={() => updatePixel(x, y, {r: 255, g: 255, b: 0})} x={x} y={y} pixel={pixel}/>)}
        </div>
    })

    return (
        <motion.div className="canvas">
        {rendered}
        </motion.div>
    )
  }

export default Canvas;