import React from 'react';
import Box from '../../../component/article';
import Grid from '../../../component/grid'
import { AnimatePresence, motion } from 'framer-motion';
import { posts } from '../../articles/articles'
import './home.scss';
import Thumbnail from '../../../component/thumbnail';
import Article from '../../../component/article';

function Home({match, history}: any) {
  console.log(match)

  const id = match?.params?.id

  return (
    <div className="home">
      <motion.h2 initial="hidden" animate="show">
          Josh <span style={{opacity: 0.3}}> LIVES HERE</span>
      </motion.h2>
      <motion.p initial="hidden" animate="show">
          I'm an Australian <span data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span data-tip="Bachelor of Computer Science">software</span> engineer.
      </motion.p>
      <Grid id="software" title="Posts">
        {posts.map((item) => <Thumbnail selected={item.id === id} key={item.id} {...item} />)}
      </Grid>
      <AnimatePresence>
        {id && <Article id={id} />}
      </AnimatePresence>
     
    </div>
  );
}

export default Home;
