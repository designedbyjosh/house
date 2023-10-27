import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Link from 'next/link'
import { useRouter } from 'next/router';

export interface index {
  posts: PostsOrPages
}

export default function BlogPost({ post }: { post: PostOrPage}) {

  return (
    <>
      <Head>
        <title>{post?.title}</title>
      </Head>
      <Container>
        <div className="h-8 bg-stone-500 w-full"></div>
        <h1 className="text-2xl md:text-3xl pt-4 pb-4">{post?.title}</h1>
        <p className="opacity-50 mb-6">{post?.excerpt}</p>
        <div>
          <Link href={`https://josh.house/travel?slug=${post.slug}`} className={`text-sm mr-1 bg-green-700 hover:bg-green-900 text-white hover:text-white py-1 px-3 rounded`}>
            Open in World Explorer
          </Link>
        </div>
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
    fallback: false
  };
}

export async function getStaticProps({ params }: any) {

  const post = await ReadPost({ slug: params.slug })

  return {
    props: {
      post
    },
    revalidate: 60
  };
}