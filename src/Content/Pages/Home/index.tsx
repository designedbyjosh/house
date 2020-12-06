import React from 'react';
import Grid from '../../../component/grid'
import { AnimatePresence, motion } from 'framer-motion';
import articles, { idToArticle } from '../../articles'
import './home.scss';
import Thumbnail from '../../../component/article/thumbnail';
import Reader from '../../../component/article/reader';

/**
 * The home page is what everyone will see when they first visit the website (beyond referral links)
 * 
 * @author Josh <code@josh.house>
 */
function Home({ match, history }: any) {

  const id = match?.params?.id

  const posts = Object.keys(articles).map((id) => {

    // Convert id to article
    const article = idToArticle(id)

    // Determine if the article is meant to be available yet
    if (Date.now() > article.metadata.published) {
      return <Thumbnail metadata={article.metadata} />
    }
    
    // By default return nothing
    return null
    
  })

  return (
    <div className="home">
      <motion.h2 initial="hidden" animate="show">
        Josh <span style={{ opacity: 0.3 }}> LIVES HERE</span>
      </motion.h2>
      <motion.p initial="hidden" animate="show">
        I'm an Australian <span data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span data-tip="Bachelor of Computer Science">software</span> engineer.
      </motion.p>
      <Grid title="Posts">
        {posts}
      </Grid>
      <AnimatePresence>
        {id && <Reader article={idToArticle(id)} />}
      </AnimatePresence>

    </div>
  );
}

export default Home;
