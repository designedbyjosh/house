import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../../components/container'
import { getPhotos } from '../../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { motion } from "framer-motion"
import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';

export interface index {
  photos: PostsOrPages
}

export default function Index({ photos }: index) {

  const [hover, setHover] = useState("");
  // const featured = photos.find(photo => photo.featured);

  return (
    <>
      <Head>
        <title>{`Josh Lives Here`}</title>
      </Head>
      <Container>
        <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          <>
            {photos.map((photo) => (
                <motion.div layout onMouseEnter={(() => setHover(photo.uuid!))} onMouseLeave={(() => setHover(""))} animate={{opacity: 1}} key={photo.uuid}>
                <Zoom classDialog='custom-zoom'><img style={{ borderRadius: 10, overflow: 'hidden', height: '450px', maxWidth: '100%'}} alt={photo.feature_image_alt!} className="pt-2 md:pt-4" src={photo.feature_image!} /></Zoom>
                <motion.p layout className="text-xs py-2 mb-1 text-gray-400/75">{hover == photo.uuid && <motion.span initial={{ scaleX: 0}} animate={{ scaleX: 1}} exit={{ scaleX: 0}}>{moment(photo.published_at).format("MMMM Do, YYYY") + " // "}</motion.span>} {photo.feature_image_caption!}</motion.p>
              </motion.div>
              ))}
          </>
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