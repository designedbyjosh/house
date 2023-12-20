import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getLatestPost, getNextPost, getPosts, getPreviousPost } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'
import parse from "html-react-parser";
import Image from 'next/image'
import EmailSignup from '@/components/emailSignup'
import { StatusIndicator } from 'evergreen-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { JsxElement } from 'typescript'
import { ReactNode } from 'react'

const replaceFiguresWithImageZoom = (elements: JSX.Element[]) => {
  if (!elements) return elements;
  return elements.map((element) => {
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

export const renderArticleButton = (article: PostOrPage, caption: ReactNode) => <a style={{ position: 'relative', overflow: 'hidden' }} href={`/blog/${article.slug}`} className="bg-neutral-100 mb-5 md:mb-0 cursor-pointer rounded">
    <div className="p-7 hover:opacity-60" style={{ zIndex: 999, position: 'relative' }}>
        <span className="text-xs dark:text-neutral-400"> 
          {caption}
        </span>
      <h2 className="font-semibold text-lg py-1">{article.title}</h2>
      <span className="text-xs dark:text-neutral-400">{article.reading_time} minute read - {moment(article.published_at).fromNow()}</span>
    </div>
    {article.feature_image && <Image
      width="1200"
      height="800"
      sizes="33vw"
      className="blur-sm rounded opacity-30 dark:opacity-20 bg-black"
      style={{ position: 'absolute', top: -10, left: -10, height: '110%', maxWidth:'110%', zIndex: 0 }}
      placeholder="empty"
      alt={article.feature_image_alt!}
      src={article.feature_image!}
    />}
  </a>


export default function BlogPost({ post, latestPost, nextPost, previousPost }: { post: PostOrPage, latestPost: PostOrPage, nextPost: PostOrPage, previousPost: PostOrPage }) {

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
        <p className="opacity-80 my-1 text-xs">{post?.reading_time} minute read - {moment(post?.published_at).fromNow()}</p>
        <hr className="mt-5" />
        <div className="blog-post mt-5">
          {html}
        </div>
        <hr className="my-10" />
        <div style={{ flex: 4 }} className="grid grid-cols-1 gap-x-5 md:grid-cols-2 md:mb-5">
          {previousPost && renderArticleButton(previousPost, "Previous Article")}
          {nextPost && renderArticleButton(nextPost, "Next Article")}
          {(!nextPost || !previousPost) && <div className="bg-neutral-100 mb-5 md:mb-0 p-7 rounded">
            <EmailSignup showCancel={false} header="" message="" signupText='Subscribe to Future Articles' />
          </div>}
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
    fallback: false
  };
}

export async function getStaticProps({ params }: any) {

  const post = await ReadPost({ slug: params.slug })
  const latestPost = await getLatestPost()
  const nextPost = await getNextPost(post!) || null
  const previousPost = await getPreviousPost(post!) || null

  return {
    props: {
      post,
      latestPost,
      nextPost,
      previousPost
    },
    revalidate: 10
  };
}