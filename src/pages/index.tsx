import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import { getPhotos } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { motion } from "framer-motion"

export interface index {
  photos: PostsOrPages
}

export default function Index({ photos }: index) {

  return (
    <>
      <Head>
        <title>{`Josh Lives Here`}</title>
      </Head>
      <Container>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} 
          className="max-w-screen-xl flex flex-col">
            <Zoom classDialog='custom-zoom'>
              <img alt={photos[0].feature_image_alt!} src={photos[0].feature_image!} />
              <p className="tracking-wider text-small py-4 text-gray-400/75">{moment(photos[0].created_at).format("MMMM Do, YYYY") + " // " + photos[0].feature_image_caption!}</p>
            </Zoom>
        </motion.div>
        <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          {photos.slice(1).map(photo => (
            <div key={photo.uuid}>
            <Zoom classDialog='custom-zoom'><img alt={photo.feature_image_alt!} className="pt-2 md:pt-4" src={photo.feature_image!} /></Zoom>
            <p className="tracking-wider text-small py-5 mb-1 text-gray-400/75">{moment(photo.created_at).format("MMMM Do, YYYY") + " // " + photo.feature_image_caption!}</p>
          </div>
          ))}
          </motion.div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const photos = await getPhotos()

  if (!getPhotos) {
    return {
      notFound: true
    }
  }

  return {
    props: { photos },
    revalidate: 30,
  }
}