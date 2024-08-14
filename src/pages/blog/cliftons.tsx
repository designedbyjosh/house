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
import { ReactNode } from 'react'

export default function BlogPost({ post, latestPost, nextPost, previousPost }: { post: PostOrPage, latestPost: PostOrPage, nextPost: PostOrPage, previousPost: PostOrPage }) {

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
        {/* {post?.feature_image && <Zoom classDialog='custom-zoom'>
          <Image
            width="0"
            height="0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-auto"
            alt={post?.feature_image_alt!}
            src={post?.feature_image!} />
        </Zoom>} */}
        <h1 className="text-2xl md:text-3xl pt-4">Hello!</h1>
        {/* <p className="opacity-80 my-1 text-xs">{post?.reading_time} minute read - {moment(post?.published_at).fromNow()} - <a className="font-semibold hover:opacity-70 cursor-pointer" href={`/photography/${post?.slug}`}>Full Size Images</a></p>
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
        </div> */}
      </Container>
    </>
  )
}

// export async function getStaticPaths() {

//   const posts = await getPosts() as PostsOrPages;

//   let paths = {};
//   paths = await posts.map(post => { return { params: { slug: post.slug } } });

//   return {
//     paths,
//     fallback: true,
//   };
// }