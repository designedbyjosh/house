import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './grid.scss';

type GridProps = {
  children?: any,
  horizontal?: boolean,
  title?: string,
  id: string
}

function Grid({ id, title, children, horizontal = false }: GridProps) {

  const [active, setActive] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
    }
  };

  const listItem = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };

  return (
    <div className="grid">
      <AnimatePresence>
        <motion.ul
          layout 
          key={`ul-${id}`}
          className="horizontal"
          variants={container}
          initial="hidden"
          animate="show"
          onMouseLeave={() => setActive(false)}
          onMouseEnter={() => setActive(true)}>
          {children}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

export default Grid;
