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
          <motion.h3 className="page-title umami--mouseover--title" initial="hidden" animate="show">
          <ReactTooltip />
            Josh <span style={{ opacity: 0.3 }}> lives here</span>
          </motion.h3>
          <motion.p className="page-subtitle umami--mouseover--subtitle" initial="hidden" animate="show">
            I design interfaces for physical and digital machines. I'm a <span className="umami--mouseover--hardware-degree" data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span className="umami--mouseover--software-degree" data-tip="Bachelor of Computer Science">software</span> engineer from <span data-tip="that means Australia">down-under</span>.
          </motion.p>
        </div>
        <div className="links umami--mouseover-links">
            <Link href="https://analytics.josh.house/share/BWhWCRhq/Josh's%20House"><i data-tip="This will take you to my Umami (self-hosted Google analytics) instance" className="clickable fas fa-chart-area umami--click--umami"></i></Link>
            <Link href="https://github.com/designedbyjosh/house"><i data-tip="This will take you to GitHub" className="clickable fab fa-github umami--click--github"></i></Link>
        </div>
      </div>
      {children}


    </div>
  );
}

export default Layout;