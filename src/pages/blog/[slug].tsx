import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getLatestPost, getPosts } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'
import parse from "html-react-parser";
import Image from 'next/image'
import EmailSignup from '@/components/emailSignup'
import { StatusIndicator } from 'evergreen-ui'

const replaceFiguresWithImageZoom = (elements: JSX.Element[]) => {
  if(!elements) return elements;
  return elements.map( (element) => {
    if (element.type != 'figure') return element

    let image = Array.isArray(element.props.children) ? element.props.children[0].props : element.props.children.props

    return <>
    <Zoom classDialog='custom-zoom'>
    <Image 
      width="0"
      height="0"
      sizes="100vw"
      className="w-full h-auto" 
      alt={image.alt} 
      src={image.src} />
    </Zoom>
    {Array.isArray(element.props.children) && element.props.children[1]}
    </>
  })
};


export default function BlogPost({ post, latestPost }: { post: PostOrPage, latestPost: PostOrPage}) {

  const html = replaceFiguresWithImageZoom(parse(post?.html || "" as string) as any)

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
        {post?.feature_image && <Zoom classDialog='custom-zoom'>
          <Image 
            width="0"
            height="0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-auto" 
            alt={post?.feature_image_alt!} 
            src={post?.feature_image!} />
        </Zoom>}
        <h1 className="text-2xl md:text-3xl pt-4">{post?.title}</h1>
        <p className="opacity-80 my-1 text-xs">A {post?.reading_time} minute read I posted {moment(post?.published_at).fromNow()}</p>
        <hr className="mt-5" />
        <div className="blog-post mt-5">
          {html}
        </div>
        <hr className="my-10" />
        <div style={{ flex: 4 }} className="grid grid-cols-1 gap-x-5 md:grid-cols-2 md:mb-5">
          <a href={`/blog/${latestPost.slug}`} className="bg-neutral-100 mb-5 md:mb-0 p-7 hover:bg-neutral-200 cursor-pointer rounded">
            <span><StatusIndicator color="red" /><span className="text-xs opacity-50">Latest Article<span className="font-semibold ml-1">{moment(latestPost.published_at).fromNow()}</span></span></span>
            <h2 className="text-sm py-1">{latestPost.title}</h2>
            <span className="text-xs opacity-30">{latestPost.reading_time} minute read</span>
          </a>
          <div className="bg-neutral-100 mb-5 md:mb-0 p-7 rounded">
            <EmailSignup showCancel={false} header="Mailing List" message="" signupText='Subscribe to Future Articles' />
          </div>
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
  const latestPost = await getLatestPost()

  return {
    props: {
      post,
      latestPost,
    },
    revalidate: 10
  };
}