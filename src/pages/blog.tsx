import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import { getPosts } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { motion } from "framer-motion"
import Link from 'next/link'

export interface index {
  posts: PostsOrPages
}

export default function Index({ posts }: index) {

  return (
      <>
      <Head>
        <title>{`Josh's Blog`}</title>
      </Head>
      <Container>
        <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} className="grid grid-cols-1">
          {posts.map((post, id) => (
            <motion.div initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: id*0.05} }}
            exit={{ opacity: 0 }} key={post.title}>
            {/* <Zoom><img  alt={post.feature_image_alt!} className="pt-2 md:pt-4 max-width-10" src={post.feature_image!} /></Zoom> */}
            {/* <Link href={track.external_urls.spotify}><p className="tracking-wider text-small py-4  text-gray-400/75">{id+1}. {track.name}</p></Link> */}
          </motion.div>
          ))}
          
          </motion.div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const posts = await getPosts()

  return {
    props: { posts },
    revalidate: 30,
  }
}