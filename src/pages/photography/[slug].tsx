import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getLatestPost, getNextPost, getPhotos, getPosts, getPreviousPost } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'

export default function PhotoFullSize({ post }: { post: PostOrPage }) {

  return (
    <>
      <Head>
        <title>{post?.title}</title>
        <meta property="og:title" content={post?.title} />
        <meta
          property="og:image"
          content={post?.feature_image!}
        />
        <meta
          name="description"
          content={post?.excerpt}
          key="desc"
        />
      </Head>
      <Container>
      <Zoom classDialog='custom-zoom'>
      <img alt={post.feature_image_alt!} style={{width: '100%'}} src={post.feature_image!}/>
      </Zoom>
      <h2 className="text-2xl mt-8">{post.feature_image_caption}</h2>
      <span className="text-lg mt-8 opacity-50">{moment(post.published_at).fromNow()}</span>

      <span className="text-sm mt-8 opacity-20">{post.feature_image_alt}</span>
      </Container>
    </>
  )
}

export async function getStaticPaths() {

  const posts = await getPhotos() as PostsOrPages;

  let paths = {};
  paths = await posts.map(post => { return { params: { slug: post.slug } } });

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }: any) {

  const post = await ReadPost({ slug: params.slug })

  return {
    props: {
      post,
    },
    revalidate: 10
  };
}