import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import './sundance.scss';
import Canvas from './canvas';
import { RGBColor } from 'react-color';
import { updateActiveColor, updateCanvas, updateRiskConsent } from './actions';


const Content: React.FC = () => {

  return (
    <>

    <div className="sundance-control-panel">
    </div>

    <div className="article-body text" >
      
    </div>
   
    </>

  )

}

const Thumbnail: React.FC<ThumbnailProps> = ({opened}) => {

  let {canvas, editing, color, consent} = useSelector((state: any) => state.sundance);

  let dispatch = useDispatch();

  return <motion.div className={`sundance-thumbnail ${opened ? "opened" : ""}`} layoutId="sundance-thumbnail">
      <Canvas 
      canvas={canvas} 
      editing={editing} 
      color={color}
      acceptedRisk={consent}
      updateCanvas={(canvas: any) => updateCanvas(dispatch, canvas)}
      setColor={(color: RGBColor) => updateActiveColor(dispatch, color)}
      updateRiskConsent={(consent: boolean) => updateRiskConsent(dispatch, consent)}
      />
    </motion.div>
}

const metadata = {
  id: "sundance",
  type: "project",
  category: {name: "Projects", icon: "fas fa-coffee"},
  title: "Sundance",
  focusIndex: 120,
  showMetadata: false,
  backgroundColor: "#a6483a",
  color: "black",
  published: Date.parse("2020-10-30T12:00:00Z"),
  thumbnail: Thumbnail,
  wide: true
} as ArticleMetadata

export default { metadata, content: Content } as Article