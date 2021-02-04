import { motion } from 'framer-motion';
import matter from 'gray-matter';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Head from '../components/head';
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

  let parsed = matter(content);

  return (
    <>
    <Head metadata={parsed.data} />
    <motion.div className="about" variants={fade} initial="hidden" exit="hidden" animate="show">
        <ReactMarkdown
            escapeHtml={false}
            source={parsed.content}
        />
    </motion.div>
    </>
  );
}

export default About;
