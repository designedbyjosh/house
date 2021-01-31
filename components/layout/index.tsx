import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Thumbnail from '../article/thumbnail';
import Grid from '../grid';
import Link from 'next/link';
import ReactTooltip from 'react-tooltip';

/**
 * The default layout is what will be retained across all pages renders, in this case, we want the home grid and header to stick 
 * around and for cards to flow in and out of the interface
 * 
 * @author Josh <code@josh.house>
 */
const Layout = ({ children }: any) => {

  return (
    <div className="home">
      <div className="header">
        <div className="titles">
          <motion.h3 className="page-title" initial="hidden" animate="show">
          <ReactTooltip />
            Josh <span style={{ opacity: 0.3 }}> lives here</span>
          </motion.h3>
          <motion.p className="page-subtitle" initial="hidden" animate="show">
            I'm an Australian <span data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span data-tip="Bachelor of Computer Science">software</span> engineer.
          </motion.p>
        </div>
        <div className="links">
          <motion.p initial="hidden" animate="show">
            <Link href="https://github.com/designedbyjosh/house"><i data-tip="This will take you to GitHub" className="clickable fab fa-github"></i></Link>
          </motion.p>
        </div>
      </div>
      {children}


    </div>
  );
}

export default Layout;