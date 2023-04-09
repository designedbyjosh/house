import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import { getPhotos } from '../lib/ghost'
import { PostsOrPages } from '@tryghost/content-api'
import moment from 'moment';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { motion } from "framer-motion"
import { SpotapiObject, socket } from '@/lib/spotapi'
import Link from 'next/link'

export interface music {
  music: SpotapiObject
}

export default function Music({ music }: music) {

  return (
    <>
      <Head>
        <title>{`Josh's Top Tracks`}</title>
      </Head>
      <Container>
        <motion.div initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }} className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {music.top_tracks?.items.map((track, id) => (
            <motion.div initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: id*0.05} }}
            exit={{ opacity: 0 }} key={track.name}>
            <Zoom><img  alt={track.name} className="pt-2 md:pt-4" src={track.album.images[0].url} /></Zoom>
            <Link href={track.external_urls.spotify}><p className="tracking-wider text-small py-4  text-gray-400/75">{id+1}. {track.name}</p></Link>
          </motion.div>
          ))}
          
          </motion.div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
    return new Promise(async function(resolve) {
        await socket.emit('immediate_refresh_request', (music: SpotapiObject) => {
            resolve({
                props: { music },
                revalidate: 30,
            });
          })
    })
}