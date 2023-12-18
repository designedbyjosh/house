import Head from 'next/head'
import { GetStaticProps } from 'next'
import Container from '../components/container'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { motion } from "framer-motion"
import { SpotapiObject, socket } from '@/lib/spotapi'
import Link from 'next/link'
import NowPlaying from '@/components/now-playing'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompactDisc, faRecordVinyl } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from '@nextui-org/react'

export interface music {
  music: SpotapiObject
}

export default function Music({ music }: music) {

  const renderAlbum = (track: SpotifyApi.TrackObjectFull, id: number, nowPlaying = false) => <motion.div style={{ position: 'relative' }} layout initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { delay: id * 0.05 } }}
    exit={{ opacity: 0 }} key={track.name}>
    <a href={track.external_urls.spotify}>
      <img alt={track.name} src={track.album.images[0].url} />
    </a>
    <Link rel="noopener noreferrer" target="_blank" href={track.external_urls.spotify}>
      <p className="tracking-wider text-small pt-2 pb-4">
        {nowPlaying && <FontAwesomeIcon className="mr-2" size="sm" spin icon={faCompactDisc} />}
        {!nowPlaying && `${id + 1}. `}{track.name}
        <br />
        <i className="opacity-50">
          {track.artists[0].name}
        </i>
      </p>
    </Link>
  </motion.div>

  const [nowPlaying, setNowPlaying] = useState<SpotifyApi.TrackObjectFull | undefined>()

  useEffect(() => { socket.emit('immediate_refresh_request', (data: any) => setNowPlaying(data.now_playing?.item)) }, []);

  // Handles any incoming request for music updates
  socket.on('update', (data) => {
    setNowPlaying(data.now_playing?.item)
  })

  return (
    <>
      <Head>
        <title>{`Josh Lives Here`}</title>
      </Head>
      <Container>
        <motion.div initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} className="grid grid-cols-2 gap-x-10 md:grid-cols-4">
          {nowPlaying && renderAlbum(nowPlaying, 0, true)}
          {music.top_tracks?.items.map((track, id) => renderAlbum(track, id))}

        </motion.div>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => new Promise(async function (resolve) {
  await socket.emit('immediate_refresh_request', (music: SpotapiObject) => {
    resolve({
      props: { music },
      revalidate: 30,
    });
  })
})