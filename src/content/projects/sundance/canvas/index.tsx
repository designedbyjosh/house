
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './canvas.scss';
import { updateCanvas, updateRiskConsent } from '../actions';
import { useDispatch, useSelector } from 'react-redux';
import { CirclePicker, RGBColor } from 'react-color';
import Button from 'react-bootstrap/Button';

interface PixelType {
    r: number,
    g: number,
    b: number
}

const Pixel: React.FC<any> = ({ x, y, pixel, onClick }) => {

    return (<div onMouseDown={onClick} onMouseEnter={(e) => e.buttons === 1 && onClick()} className="pixel" style={{ backgroundColor: `rgb(${pixel.r},${pixel.g},${pixel.b})` }} key={`${x}_${y}_pixel`} />)

}

const Canvas: React.FC<any> = ({ canvas, editing, color, acceptedRisk, updateRiskConsent, updateCanvas }) => {

    const updatePixel = (x: number, y: number, pixel: PixelType) => {
        let current = JSON.parse(JSON.stringify(canvas));
        let row = current[y];
        row[x] = pixel;
        current[y] = row;
        updateCanvas(current);
    }

    let rendered = canvas && canvas.map((row: any, y: number) => {
        return <div className={`canvas_row ${editing ? "editing" : ""}`}>
            {row.map((pixel: any, x: number) => {
            let handleClick = () => {editing && updatePixel(x, y, color)};
            return <Pixel onClick={handleClick} x={x} y={y} pixel={pixel} />
        })}
        </div>
    })

    const warning = <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="content-warning expanded-absolute">
        <p>Sundance is a project that may be contributed to by anyone in the world. None of the artwork or drawings displayed are a portrayal or representation of my views. You may encounter confronting or distressing content and you do so at your own risk. </p>
        <Button onClick={() => updateRiskConsent(true)} variant="outline-light"> I accept this risk </Button>
    </motion.div>

    return (
        <div className="full-width">

            <div className="canvas-container">
                {!acceptedRisk && warning}
                <motion.div initial={{ opacity: acceptedRisk ? 1 : 0 }} animate={{ opacity: 1 }} className={`canvas ${!acceptedRisk && "blurred"}`}>

                    {rendered}
                </motion.div>
            </div>

        </div>
    )
}

export default Canvas;