import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Thumbnail from '../article/thumbnail';
import Grid from '../grid';
import Link from 'next/link';
import ReactTooltip from 'react-tooltip';
import {version} from '../../package.json';

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
          <Link href="/">
          <motion.h3 className="title clickable" initial="hidden" animate="show">
            Josh <span style={{ opacity: 0.3 }}> lives here</span>
          </motion.h3>
          </Link>
          <motion.p className="subtitle" initial="hidden" animate="show">
            I design interfaces for physical and digital systems. I'm a <span className="umami--mouseover--hardware-degree" data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span className="umami--mouseover--software-degree" data-tip="Bachelor of Computer Science">software</span> engineer from <span data-tip="that means Australia">down-under</span>. <Link href="/about">more</Link>
          </motion.p>
        </div>
        <div className="links umami--mouseover-links">
            <a className="umami--click--email" href="mailto:hello@josh.house"><i className="clickable fas fa-envelope umami--click--umami"></i></a>
            <a className="umami--click--analytics" target="_blank" href="https://analytics.josh.house/share/BWhWCRhq/Josh's%20House"><i data-tip="This will take you to my Umami (self-hosted Google analytics) instance" className="clickable fas fa-chart-area umami--click--umami"></i></a>
            <a className="umami--click--github"target="_blank" href="https://github.com/designedbyjosh/house"><i data-tip="This will take you to GitHub" className="clickable fab fa-github umami--click--github"></i></a>
        </div>
      </div>
      {children}
      <div className="footer">
        <p>Built from scratch by a 🍣 lover called <a href="mailto:hey@josh.house">Josh</a></p>
        <p style={{opacity: 0.5}}><a href={`https://github.com/designedbyjosh/house/releases/tag/v${version}`}>v{version}</a></p>
      </div>
    </div>
    
  );
}

export default Layout;