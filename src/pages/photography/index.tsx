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
import Link from 'next/link'
import Image from 'next/image'
import { ExtractImageUrls } from './[slug]'

export interface index {
  photos: PostsOrPages
}

export default function Index({ photos }: index) {

  const [hover, setHover] = useState("");
  // const featured = photos.find(photo => photo.featured);
  return (
    <>
      <Head>
        <title>{`Joshua Whitcombe - Photography`}</title>
      </Head>
      <Container>
        <motion.div initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
          <>
            {photos.sort((a, b) => (new Date(b.published_at!).getTime()) - (new Date(a.published_at!).getTime())).map((photo) => {
              const additionalImages = ExtractImageUrls(photo.html!).length
              return (
                <motion.div style={{ position: 'relative' }} layout onMouseEnter={(() => setHover(photo.uuid!))} onMouseLeave={(() => setHover(""))} animate={{ opacity: 1 }} key={photo.uuid}>
                  {photo.tags?.map((a) => a.name).includes('blog' as any) && <div style={{ top: -10, left: -10, position: 'absolute', zIndex: 999 }}>
                    <Link href={`/blog/${photo.slug}`} className={`mr-1 bg-green-800 hover:bg-green-900 text-white hover:text-white py-1 px-3 rounded`}>
                      Read the Backstory
                    </Link>
                  </div>}
                  <Zoom classDialog='custom-zoom'>
                    <Image
                      width="1200"
                      height="800"
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 100vw"
                      className="w-full h-auto"
                      placeholder="empty"
                      alt={photo.feature_image_alt!}
                      src={photo.feature_image!}
                    />
                  </Zoom>
                  <a href={`/photography/${photo.slug}`} >
                    <motion.p layout className="text-xs py-2 mb-5 text-gray-400/75 hover:opacity-70">
                      <h2 className="text-sm mb-1 font-bold">{photo.feature_image_caption!}</h2>
                      <motion.span className="text-xs" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}>
                        {moment(photo.published_at).format("MMMM Do, YYYY")} {additionalImages > 0 && `+ ${additionalImages} more image${additionalImages > 1 ? "s" : ""}`}
                      </motion.span>
                    </motion.p>
                  </a>
                </motion.div>)
            })}
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