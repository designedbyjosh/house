import { motion } from 'framer-motion';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { fade } from '../styles/animations/transitions';

export async function getStaticProps() {
  const fs = require("fs");
  const content = fs.readFileSync(`${process.cwd()}/content/about.md`, {
    encoding: "utf-8",
  });
  return {
    props: {
      content
    },
  };
}

/**
 * The about page has a bit more information about me.
 * 
 * @author Josh <code@josh.house>
 */
const About = ({ content }: {content: string}) => {

  return (
    <motion.div className="about" variants={fade} initial="hidden" exit="hidden" animate="show">
        <ReactMarkdown
            escapeHtml={false}
            source={content}
        />
    </motion.div>
  );
}

export default About;
