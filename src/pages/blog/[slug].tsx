import Head from 'next/head'
import { GetStaticProps, GetStaticPropsContext } from 'next'
import Container from '../../components/container'
import { ReadPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'

export interface index {
  posts: PostsOrPages
}

export default function BlogPost({ post }: { post: PostOrPage}) {

  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <Container>
        <div className="h-8 bg-stone-500 w-full"></div>
        <h1 className="text-2xl md:text-3xl pt-4 pb-4">{post.title}</h1>
        <p className="opacity-50 mb-10">BLUF: {post.excerpt}</p>
        <div className="blog-post" dangerouslySetInnerHTML={{"__html": post.html as string}} />
      </Container>
    </>
  )
}

export async function getStaticPaths() {

  const posts = await getPosts() as PostsOrPages;

  const paths = posts.map(post => { return { params: { slug: post.slug } } })

  return {
    paths,
    fallback: true
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