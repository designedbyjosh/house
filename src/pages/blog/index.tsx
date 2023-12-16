import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../../components/container'
import { SubscribeToNewsletter, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Link from 'next/link'
import moment from 'moment'
import readingTime from 'reading-time'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faEye } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  const renderPost = (post: PostOrPage) => {
    return <div key={post.id} className="mb-10">
      <Link href={`/blog/${post.slug}`}>
        <div className="font-bold">
        {post.title} 
          </div>
      </Link>
      <span className=" text-xs opacity-30">{moment(post.published_at).fromNow()} - <span style={{opacity: '25%'}}></span>{post.reading_time} minute read</span>
      <div>
        <span className="opacity-50 text-xs">{post.excerpt}</span>
      </div>
    </div>
  }

  return (
    <>
      <Head>
        <title>{`Josh Writes Here`}</title>
      </Head>
      <Container>
        {posts.map(post => renderPost(post))}
      </Container>
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