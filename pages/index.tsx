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
      articles: extractMarkdownFiles(`${process.cwd()}/content/article`),
      problems: extractMarkdownFiles(`${process.cwd()}/content/problem/notes`)
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
      <hr />
      <div className="submodule">
        <h3>
          Daily Coding Problem
        </h3>
        <p className="caption">In the same way my grandparents do newspaper crosswords to keep their minds sharp, I do a coding problem when I can to keep mine sharp too. These are my humble solutions and ramblings of logic to get to them. </p>
      </div>
        <ul className="daily-problems">
        {problems.sort((a,b) => ((matter(a).data as ArticleMetadata).id) < (matter(b).data as ArticleMetadata).id).map((reference) => {
          let metadata = matter(reference).data as ArticleMetadata;
          return <li key={metadata.id} data-tip={moment(metadata.published).toLocaleString()} className="daily-problem-link clickable"><Link href={`/${metadata.type}/${metadata.id}`} ><span><b>{metadata.title}</b> solved {moment(metadata.published).fromNow()}</span></Link></li>
        } )}
        </ul>
      </>
  );
}

export default Home;
