import React, { useEffect } from 'react';
import Grid from '../../../component/grid'
import { AnimatePresence, motion } from 'framer-motion';
import { idToArticle, posts } from '../../articles'
import './home.scss';
import Thumbnail from '../../../component/article/thumbnail';
import Reader from '../../../component/article/reader';
import { useDispatch } from 'react-redux';
import { configure } from '../../../actions/networking';
import { idToProject, projects } from '../../projects';

/**
 * The home page is what everyone will see when they first visit the website (beyond referral links)
 * 
 * @author Josh <code@josh.house>
 */
function Home({ match, history }: any) {

  const dispatch = useDispatch();

  useEffect(() => {
    configure(dispatch, "http://localhost:8999")
  }, [])
  

  const {type, id} = match?.params

  const render = (reference: string, renderFn: any) => {

     // Convert id to article
     const article = renderFn(reference)

     console.log(article)

     // Determine if the article is meant to be available yet
     if (Date.now() > article.metadata.published && reference !== id) {
       return <Thumbnail metadata={article.metadata} />
     }
     
     // By default return nothing
     return null

  }

  const renderedPosts = Object.keys(posts).map((reference) => render(reference, idToArticle));
  const renderedProjects = Object.keys(projects).map((reference) => render(reference, idToProject));

  const idToContent = (id: string, type: string) : any => {
    switch(type){
      case "project":
        return idToProject(id);
      case "article":
        return idToArticle(id);
      default:
        return null;
    }
  }

  return (
    <div className={`home`}>
      <motion.h3 initial="hidden" animate="show">
        Josh <span style={{ opacity: 0.3 }}> lives here</span>
      </motion.h3>
      <motion.p initial="hidden" animate="show">
        I'm an Australian <span data-tip="Bachelor of Mechatronics Engineering (Honours)">hardware</span> and <span data-tip="Bachelor of Computer Science">software</span> engineer.
      </motion.p>
      <Grid title="Projects">
        {renderedProjects}
      </Grid>
      <Grid title="Articles">
        {renderedPosts}
      </Grid>
      <AnimatePresence>
        {id && <Reader article={idToContent(id, type)} />}
      </AnimatePresence>
    </div>
  );
}

export default Home;
