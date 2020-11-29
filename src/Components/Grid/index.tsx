import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './grid.scss';
import Box from '../Box';

type GridProps = {
    children?: any,
    horizontal?: boolean,
    title?: string,
    key?:string
}

function Grid({ key, title, children, horizontal = false }: GridProps) {

    const [active, setActive] = useState(false);

    const container = {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
          }
        }
      };

      const listItem = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
      };

    return (
        <div className="grid">
            <AnimatePresence>
                <motion.ul layout key={key} className="horizontal" variants={container} initial="hidden" animate="show" onMouseLeave={() => setActive(false)} onMouseEnter={() => setActive(true)}>
                    {active && title && <motion.div variants={listItem} className="title">{title}</motion.div>}
                    {children}
                </motion.ul>
            </AnimatePresence>
        </div>
    );
}

export default Grid;
