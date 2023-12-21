import Head from 'next/head'
import Container from '../../components/container'
import { ReadPost, getLatestPost, getNextPost, getPhotos, getPosts, getPreviousPost } from '../../lib/ghost'
import { PostOrPage, PostsOrPages } from '@tryghost/content-api'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import moment from 'moment'
import parse from "html-react-parser";
import { renderArticleButton, replaceFiguresWithImageZoom } from '../blog/[slug]'
import { motion } from "framer-motion"

export const ExtractImageUrls = (html: string) => {
    if (!html) return []
    const elements = parse(html) as JSX.Element[]
    return Array.isArray(elements) ? elements.flatMap((element) => {
        if (element.type != 'figure') return []
        let image = Array.isArray(element.props.children) ? element.props.children[0].props : element.props.children.props
        return image.src
    }) : []
}

export default function PhotoFullSize({ post }: { post: PostOrPage }) {

    const parsed = parse(post?.html || "" as string)
    const html = replaceFiguresWithImageZoom(parsed as any, true)
    const urls = ExtractImageUrls(post?.html!)

    if (!post?.feature_image) return <div />

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
                    <img alt={post.feature_image_alt!} style={{ width: '100%' }} src={post.feature_image!} />
                </Zoom>
                <h2 className="text-2xl mt-8">{post.feature_image_caption}</h2>
                <span className="text-lg mt-8 opacity-50">{moment(post.published_at).fromNow()}</span>

                <motion.div className="text-md mt-5">
                    {post.excerpt}
                </motion.div>

                {post?.tags && post?.tags.map((a) => a.name).includes("blog") && <div className="grid mt-10">
                     {renderArticleButton(post, "Read the Full Article")}
                </div>}

                <motion.div initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }} className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 mt-10 !text-left">
                    {html}
                </motion.div>
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
        fallback: true,
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