import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getLatestPost, getNextPost, getPosts, getPreviousPost } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment, { Moment } from 'moment'
import parse from "html-react-parser";
import Image from 'next/image'
import EmailSignup from '@/components/emailSignup'
import { ReactNode, useEffect } from 'react'
import Link from 'next/link'

export const replaceFiguresWithImageZoom = (elements: JSX.Element[], filterImages=false) => {

  if (!elements) return elements;
  return Array.isArray(elements) ? elements.flatMap((element) => {
    if (element.type != 'figure') return (filterImages ? [] : element)

    let image = Array.isArray(element.props.children) ? element.props.children[0].props : element.props.children.props

    return <div>
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
    </div>
  }) : elements
};

export const renderArticleButton = (article: PostOrPage, caption: ReactNode) => <Link style={{ position: 'relative', overflow: 'hidden', width: '100%' }} href={`/blog/${article.slug}`} className="dark:bg-black bg-white mb-5 md:mb-0 cursor-pointer rounded flex flex-col justify-center h-full">
  <div className="p-7 hover:opacity-60" style={{ zIndex: 999, position: 'relative' }}>
    <span className="text-xs dark:text-neutral-400">
      {caption}
    </span>
    <h2 className="font-semibold text-lg pt-1">{article.title}</h2>
    <span className="text-xs dark:text-neutral-400">{article.reading_time} minute read - {moment(article.published_at).fromNow()}</span>
  </div>
  {article.feature_image && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          zIndex: 0,
          transform: 'scale(1.1)',
          filter: 'blur(3px)', // Apply blur effect
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            paddingBottom: '75%', // This maintains a 4:3 aspect ratio. Adjust as needed.
          }}
        >
          <Image
            src={article.feature_image}
            alt={article.feature_image_alt!}
            layout="fill"
            objectFit="cover" // Maintains aspect ratio and covers the container
            placeholder="empty"
            className="opacity-30"
          />
        </div>
      </div>
    )}
</Link>

export type ArticleReadStatus = {
  [slug: string]: boolean; // Key is the article slug, value is a boolean
};

// Determines if a post is new based on if the user has read it before on this device, and if the article has been posted since
// first visited the page
export function hasArticleBeenRead(articleReadStatus: ArticleReadStatus, post: PostOrPage): boolean {
  return (articleReadStatus[post.slug] || false); // Defaults to false if slug is not found
}

export function isArticleNewSinceFirstLogin(post: PostOrPage, firstVisitDate: number): boolean {
  return (moment(post.published_at).isAfter(moment(firstVisitDate)));
}

export default function BlogPost({ post, latestPost, nextPost, previousPost }: { post: PostOrPage, latestPost: PostOrPage, nextPost: PostOrPage, previousPost: PostOrPage }) {

  const html = replaceFiguresWithImageZoom(parse(post?.html || "" as string) as any)

  useEffect(() => {
    if (typeof window !== 'undefined') {
        var readArticles = JSON.parse(localStorage.getItem('readArticles') as any)
        var firstVisitDate = JSON.parse(localStorage.getItem('firstVisitDate') as any)

        if (!readArticles) {
          readArticles = {
            [post.slug]: true
          };
          localStorage.setItem('readArticles', JSON.stringify(readArticles));
        }
        else {
          readArticles[post.slug] = true
          localStorage.setItem('readArticles', JSON.stringify(readArticles));
        }
    }
}, [])

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
        <p className="opacity-80 my-1 text-xs">{post?.reading_time} minute read - {moment(post?.published_at).fromNow()} - <a className="font-semibold hover:opacity-70 cursor-pointer" href={`/photography/${post?.slug}`}>Full Size Images</a></p>
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
    fallback: true,
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