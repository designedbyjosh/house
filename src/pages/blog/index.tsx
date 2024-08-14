import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../../components/container'
import { SubscribeToNewsletter, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Link from 'next/link'
import moment, { now } from 'moment'
import readingTime from 'reading-time'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faEye, faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { hasArticleBeenRead, isArticleNewSinceFirstLogin, renderArticleButton } from './[slug]'
import { StatusIndicator } from 'evergreen-ui'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  var readArticles = {}
  var firstVisitDate = moment.now()
  if (typeof window !== 'undefined') {
    readArticles = JSON.parse(localStorage.getItem("readArticles") as any)
    firstVisitDate = JSON.parse(localStorage.getItem("firstVisitDate") as any)
    if (!firstVisitDate) localStorage.setItem("firstVisitDate", JSON.stringify(moment.now()))
  }

  const renderPost = (post: PostOrPage, index: number) => {
    return <div className="mb-7" style={{height: 150, position: 'relative'}}>
      {readArticles && !hasArticleBeenRead(readArticles, post) && isArticleNewSinceFirstLogin(post, firstVisitDate) && <div style={{ top: -5, right: -5, opacity: 0.9, position: 'absolute', zIndex: 999, backgroundColor: 'red', width: 15, height: 15, borderRadius: 7.5 }} />}
      {renderArticleButton(post, null)}
    </div>
  }

  return (
    <>
      <Head>
        <title>{`Joshua Whitcombe - Blog`}</title>
      </Head>
      <Container>
        {posts.map((post, index) => renderPost(post, index))}
      </Container>
      <div className="flex items-center justify-center h-full">
        <span className="text-xs text-gray-800 dark:text-neutral-400">
          I&apos;ve posted {posts.length} times since {moment(posts[posts.length-1].created_at).fromNow()}
        </span>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const posts = await getPosts()

  return {
    props: { posts },
    revalidate: 60,
  }
}