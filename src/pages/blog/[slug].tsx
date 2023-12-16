import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'
import parse from "html-react-parser";

export interface index {
  posts: PostsOrPages
}

const replaceFiguresWithImageZoom = (elements: JSX.Element[]) => {
  if(!elements) return elements;
  return elements.map((element) => {
    if (element.type != 'figure') return element
    return <>
    <Zoom classDialog='custom-zoom'>
      <img alt={element.props.children[0].props.alt} className="" src={element.props.children[0].props.src} />
    </Zoom>
    {element.props.children[1]}
    </>
  })
};

export default function BlogPost({ post }: { post: PostOrPage}) {

  const html = replaceFiguresWithImageZoom(parse(post?.html as string) as any)

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
        {/* <p className="opacity-50 my-3">{post?.excerpt}</p> */}
        <Zoom classDialog='custom-zoom'><img alt={post?.feature_image_alt!} className="" src={post?.feature_image!} /></Zoom>
        <h1 className="text-2xl md:text-3xl pt-4">{post?.title}</h1>
        <p className="opacity-80 my-1 text-xs">A {post?.reading_time} minute read I posted {moment(post?.published_at).fromNow()}</p>
        <hr className="mt-5" />
        <div className="blog-post mt-5">
          {html}
        </div>
        
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