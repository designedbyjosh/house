import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../../components/container'
import { getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Link from 'next/link'
import moment from 'moment'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  const renderPost = (post: PostOrPage) => {
    return <div key={post.id} className="mb-10">
      <Link href={`/blog/${post.slug}`}>
        <div className="font-bold">
        {post.title} <span className="opacity-30">- {moment(post.created_at).fromNow()}</span>
          </div>
      </Link>
      <div>
        <i className="opacity-50 text-sm">BLUF: {post.excerpt}</i>
      </div>
    </div>
  }

  return (
    <>
      <Head>
        <title>{`Josh Lives Here - Blog`}</title>
      </Head>
      <Container>
        {posts.map(post => renderPost(post))}
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const posts = await getPosts()

  if (!posts) {
    return {
      notFound: true
    }
  }

  return {
    props: { posts },
    revalidate: 30,
  }
}