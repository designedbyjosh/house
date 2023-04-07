import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import Layout from '../components/layout'
// import { getAllPostsForHome } from '../lib/api'
import { CMS_NAME } from '../lib/constants'
import { getPosts } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'

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
          <h1 className="text-4xl md:text-6xl pt-16 pb-2 sm:pt-16">Joshua Whitcombe</h1>
          <h3 className="text-xl pb-8 sm:pb-8">I am a software engineer living in Australia, with personal interests in socially beneficial engineering, photography, and residential data analytics.</h3>
          <img src={posts[0].feature_image!} />
          <p className="tracking-wider text-small py-4 text-gray-400/75">{posts[0].feature_image_caption!}</p>
        </div>


      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  console.log("getting posts")
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