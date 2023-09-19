'use client'
import Container from '@/components/container';
import { motion } from "framer-motion"
import moment from 'moment';
import Head from 'next/head';
import { useState } from 'react';
import { GetStaticProps } from 'next'
import { getTravelPosts } from '@/lib/ghost';
import Overlay from '@/components/explorer/overlay';
import { PostOrPage } from '@tryghost/content-api';
import Map from '@/components/map';

export interface PostOrPageWithLocation extends PostOrPage {
  lat?: string,
  long?: string,
  zoom?: string
}
export interface index {
  travel?: PostOrPageWithLocation[]
}

// Stored in blog posts, the excerpt of a travel post is the location metadata

export default function Index({ travel }: index) {

  const [currentPage, setCurrentPage] = useState(0);
  const current = travel![currentPage];
  
  return (
    <>
    <Head>
        <title>{`Josh Travels Here`}</title>
      </Head>
      <Container>
        <Overlay 
          index={currentPage}
          totalIndex={travel?.length}
          previousIndex={() => {setCurrentPage(currentPage-1)}}
          nextIndex={() => {setCurrentPage(currentPage+1)}}
          text={current.title!}
          image={current.feature_image}
          image_alt={current.feature_image_alt}
          date={new Date(current.published_at!)} 
          updated={new Date(current.updated_at!)} />
      </Container>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{opacity: 1 }}
      exit={{ opacity: 0 }} >
       <Map 
       time={'dusk'} 
       style={{
        top: 0,
        left:0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        zIndex: -99,
      }}
       latitude={current.lat} 
       longitude={current.long}
       zoom={parseInt(current.zoom!)}  />
    </motion.div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  let travelPosts = await getTravelPosts()

  let travel = travelPosts!.map(post => {

    // Find matches
    const re = /([a-zA-Z!]+:\s*[" ]?([-a-z0-9\s.]+)[" $])/gi
    const matches = post.codeinjection_head?.match(re)

    // This is horrible, we should change this
    try {
      const lat = matches![0].split(":")[1].replaceAll('"', '')
      const long = matches![1].split(":")[1].replaceAll('"', '')
      const zoom = matches![2].split(":")[1].replaceAll('"', '')
      return {...post, lat, long, zoom} as PostOrPageWithLocation
    }
    catch {
      return {...post} as PostOrPageWithLocation
    }
    
  }) as PostOrPageWithLocation[]

  if (!getTravelPosts) {
    return {
      notFound: true
    }
  }
  return {
    props: { travel },
    revalidate: 30,
  }
}