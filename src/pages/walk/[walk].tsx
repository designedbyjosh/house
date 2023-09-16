import Head from 'next/head'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import Container from '../../components/container'
import { ReadPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import { Map } from 'react-map-gl'

export interface index {
  walk: string
}

export default function WalkPost({ walk }: { walk: string}) {

  return (
    <>
      <Head>
        <title>{walk}</title>
      </Head>
      <Container>
      <Map
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 14
      }}
      style={{width: 600, height: 400}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
    />
      </Container>
    </>
  )
}

export async function getStaticPaths() {

  const posts = await getPosts() as PostsOrPages;

  let paths = {};
  paths = await posts.map(post => { return { params: { slug: post.slug } } });

  return {
    paths: [{params: {walk: "test"}}],
    fallback: true
  };
}

export async function getStaticProps({ params }: any) {

//   const post = await ReadPost({ slug: params.walk })

  return {
    props: {
      walk: params.walk
    },
    revalidate: 60
  };
}