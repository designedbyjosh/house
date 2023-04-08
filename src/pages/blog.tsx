import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import { getPosts } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  return (
    <>
      <Head>
        <title>{`Josh Lives Here - Blog`}</title>
      </Head>
      <Container>
        Sorry, this is under construction...
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