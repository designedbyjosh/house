import {  AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import Layout from '../components/layout';
import ReactTooltip from 'react-tooltip';

import '../styles/globals.scss';
import '../styles/article.scss';
import '../styles/thumbnail.scss';
import '../styles/grid.scss';
import '../styles/reader.scss';

function House({ Component, pageProps }) {
  return <div className="container">
      <Layout>
        <AnimateSharedLayout type="crossfade">
        <ReactTooltip />
          <AnimatePresence>
            <Component {...pageProps} />
          </AnimatePresence>
        </AnimateSharedLayout>
      </Layout>
  </div>
}

export default House
