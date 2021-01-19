import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import './sundance.scss';
import Canvas from './canvas';

const Content: React.FC = () => {

  let queue = useSelector((state: any) => state.sundance.queue);

  return (
    <>
      <h2>Hey there!</h2>
      <p>Let's make sure we're all connected! {queue}</p>
    </>
  )

}

const Thumbnail: React.FC<ThumbnailProps> = ({opened}) => {

  let canvas = useSelector((state: any) => state.sundance.canvas);
  return <motion.div style={{backgroundColor: metadata.backgroundColor}} className={`sundance-thumbnail ${opened && "opened"}`} layoutId="sundance-thumbnail">
      {opened ? <Canvas canvas={canvas}/> : <h1>Sundance</h1>}
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
  thumbnail: Thumbnail
} as ArticleMetadata

export default { metadata, content: Content } as Article