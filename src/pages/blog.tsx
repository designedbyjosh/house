import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import Layout from '../components/layout'
// import { getAllPostsForHome } from '../lib/api'
import { CMS_NAME } from '../lib/constants'
import { getPosts } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import Header from '@/components/header'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  return (
    <Layout>
      <Head>
        <title>{`Josh Lives Here`}</title>
      </Head>
      <Container>
        <div className="flex flex-col">
          <Header />
          <img src={posts[0].feature_image!} />
          <p className="tracking-wider text-small py-4 text-gray-400/75">{posts[0].feature_image_caption!}</p>
        </div>


      </Container>
    </Layout>
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