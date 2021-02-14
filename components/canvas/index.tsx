import react, { useEffect, useRef, useState } from "react";
import matter from 'gray-matter';
import Reader from "../../components/article/reader";
import Head from '../../components/head';
import { Layer, Rect, Stage } from "react-konva";
import { motion } from "framer-motion";

/**
 * Renders a canvas that will fill the container's width
 * 
 * @author Josh <code@josh.house> 
 */
const Canvas = ({ canvas }) => {

    const container = useRef(null);

    const [dimensions,setDimensions] = useState({height: 300, width: 300, pixelWidth: 10})
    
    useEffect(() => {
        const width = container.current.offsetWidth;
        const pixelWidth = width/canvas[0].length
        const height = pixelWidth * canvas.length;
        setDimensions({height, width, pixelWidth})
    }, [])

    return (<motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5}} ref={container} style={{width: '100%'}}>
        <Stage width={dimensions.width} height={dimensions.height}>
            <Layer>
                {canvas.map((row, y) => {
                    return row.map((pixel, x) => {
                        return <Rect
                        width={dimensions.pixelWidth}
                        height={dimensions.pixelWidth}
                        x={dimensions.pixelWidth*x}
                        y={dimensions.pixelWidth*y}
                        fill={`rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`}
                        />
                    })
                })}
                
            </Layer>
        </Stage>
    </motion.div>)
};

export default Canvas;
