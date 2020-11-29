import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './box.scss';

type BoxProps = {
    title?: string,
    subtitle?: string,
    backgroundColor?: string,
    primaryColor?: string,
    secondaryColor?: string,
    key: string
}


function Box({ title, subtitle, backgroundColor, primaryColor, secondaryColor, key }: BoxProps) {

    const listItem = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
      };

    return (
            <motion.li
                layout
                key={key}
                className="box"
                variants={listItem}
                >

                <motion.div 
                    className="content"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    style={{backgroundColor: backgroundColor}}
                >

                    <motion.h1>
                        {title}
                    </motion.h1>

                </motion.div>
            </motion.li>
        )
}

export default Box;
