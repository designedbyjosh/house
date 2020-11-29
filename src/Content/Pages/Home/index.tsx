import React from 'react';
import Box from '../../../Components/Box';
import Grid from '../../../Components/Grid'
import { motion } from 'framer-motion';
import { software, hardware } from '../../Articles/articles'
import './home.scss';

function Home() {
  return (
    <div className="home">
      <motion.h2 initial="hidden" animate="show">
          SOMEONE <span style={{opacity: 0.3}}> LIVES HERE</span>
      </motion.h2>
      <motion.p initial="hidden" animate="show">
          Some text will go here.
      </motion.p>
      <Grid title="Software">
        {software.map((item) => <Box {...item} />)}
      </Grid>
      <Grid title="Hardware">
        {hardware.map((item) => <Box {...item} />)}
      </Grid>
    </div>
  );
}

export default Home;
