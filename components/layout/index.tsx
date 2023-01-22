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
            Josh <span style={{ opacity: 0.3 }}> Whitcombe</span>
          </motion.h3>
          </Link>
          <motion.p className="subtitle" initial="hidden" animate="show">
          <span className="umami--mouseover--software-degree" data-tip="Bachelor of Computer Science">Software</span> engineer at <span data-tip="that means Australia">Palantir</span>
          </motion.p>
        </div>
        <div className="links umami--mouseover-links">
            <a className="umami--click--email" href="mailto:hello@josh.house"><i className="clickable fas fa-envelope umami--click--umami"></i></a>
            <a target="_blank" href="https://linkedin.com/in/anengineercalledjosh"><i className="clickable fas fa-user"></i></a>
            <a className="umami--click--github" target="_blank" href="https://github.com/designedbyjosh/house"><i data-tip="This will take you to GitHub" className="clickable fab fa-github umami--click--github"></i></a>
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