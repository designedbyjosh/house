import React from 'react';
import {  motion } from 'framer-motion';
import './grid.scss';
import { fade, staggered } from '../../styling/animations/transitions';

type GridProps = {
  children?: any,
  title?: string,
  id?: string
}

/**
 * A grid contains multiple grid elements (usually thumbnails) that are transitioned in
 * 
 * @author Josh <code@josh.house>
 */
function Grid({ id, title, children = false }: GridProps) {

  return (
    <div
      key={`grid-${id}`}
      className="grid">
      {title && <motion.span
        variants={fade}
        className="title">
        {title}
      </motion.span>}
      <motion.ul
        initial="hidden"
        animate="show"
        variants={staggered}
        layout
        className="horizontal">
        {children}
      </motion.ul>
    </div>
  );
}

export default Grid;
