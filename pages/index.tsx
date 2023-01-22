import React from 'react';
import Grid from '../components/grid';
import Thumbnail from '../components/article/thumbnail';
import matter from 'gray-matter';
import Head from 'next/head';
import ReactTooltip from 'react-tooltip';
import { useRouter } from 'next/router';
import { WSAENAMETOOLONG } from 'constants';
import Link from 'next/link';
import moment from 'moment';

const extractMarkdownFiles = (path: string) => {
  const fs = require("fs");
  let directory = fs.readdirSync(path, "utf-8");
  let files = directory.filter((fn) => fn.endsWith(".md"));

 return files.map((blog) => {
    let current = `${path}/${blog}`;
    return fs.readFileSync(current, {
      encoding: "utf-8",
    });
  });
}

export async function getStaticProps() {

  return {
    props: {
      articles: extractMarkdownFiles(`${process.cwd()}/content/article`)
    },
  };
}

/**
 * The home page is what everyone will see when they first visit the website (beyond referral links)
 * 
 * @author Josh <code@josh.house>
 */
const Home = ({ articles, problems }: any) => {

  return (
    <>
    <Head>
        <title>Josh's House</title>
        <meta name="description" content="A digital collection of my projects, articles and work." />
        <meta property="og:type" content="website" />
        <meta name="og:title" property="og:title" content="Josh's House" />
        <meta name="og:description" property="og:description" content="A digital collection of my projects, articles and work." />
        <meta property="og:site_name" content="Josh's House" />
        <meta property="og:url" content="https://josh.house" />  
        <meta name="twitter:card" content="summary" /> 
        <meta name="twitter:title" content="Josh's House" />
        <meta name="twitter:description" content="A digital collection of my projects, articles and work." />
        <link rel="icon" type="image/png" href="/static/images/favicon.png" />
        <link rel="apple-touch-icon" href="/static/images/favicon.png" />
        <link rel="stylesheet" href="" /> 
        <link rel="canonical" href="" />
        <link rel="shortcut icon" href="/favicon.png" />
        <script type="text/javascript" src="" ></script>
    </Head>
      <Grid title="Posts">
        {articles.map((reference) =>  <Thumbnail metadata={matter(reference).data as ArticleMetadata} />)}
      </Grid>
      </>
  );
}

export default Home;
