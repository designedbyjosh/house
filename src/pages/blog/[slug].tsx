import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'
import readingTime from 'reading-time'

export interface index {
  posts: PostsOrPages
}

export default function BlogPost({ post }: { post: PostOrPage}) {

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
        <div className="h-2 bg-stone-500 w-full"></div>
        <h1 className="text-2xl md:text-3xl pt-4">{post?.title}</h1>
        <p className="opacity-80 my-1 text-xs">{moment(post?.published_at).fromNow()} by Joshua Whitcombe | {Math.floor(readingTime(post?.html).minutes)} minute read</p>
        {/* <p className="opacity-50 my-3">{post?.excerpt}</p> */}
        <Zoom classDialog='custom-zoom'><img alt={post?.feature_image_alt!} className="my-4" src={post?.feature_image!} /></Zoom>
        {/* <div>
          <Link href={`https://josh.house/travel?slug=${post.slug}`} className={`text-sm mr-1 bg-green-700 hover:bg-green-900 text-white hover:text-white py-2 px-3 rounded`}>
           <FontAwesomeIcon className='mx-1' size='sm' icon={faGlobe} /> Read in World Explorer
          </Link>
        </div> */}
        <div className="blog-post mt-5" dangerouslySetInnerHTML={{"__html": post?.html as string}} />
        
      </Container>
    </>
  )
}

export async function getStaticPaths() {

  const posts = await getPosts() as PostsOrPages;


  let paths = {};
  paths = await posts.map(post => { return { params: { slug: post.slug } } });

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }: any) {

  const post = await ReadPost({ slug: params.slug })

  return {
    props: {
      post
    },
    revalidate: 10
  };
}