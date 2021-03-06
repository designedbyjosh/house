import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'
import moment, { lang } from 'moment';
import ReactMarkdown from 'react-markdown';
import { fade } from '../../../styles/animations/transitions';
import CodeBlock from '../code';

type ReaderProps = {
    article: Article,
    style?: React.CSSProperties | undefined
}

/**
 * A reader is an expanded version of the thumbnail (@see /src/component/article/thumbnail) that now has the article's content in it 
 * 
 * @author Josh <code@josh.house>
 */
function Reader({ article, style }: ReaderProps) {

    const { content, metadata } = article;

    return (
      <>
            <article className="article-container open">
                <motion.div
                    className="article-content open"
                    layoutId={`article-container-${metadata.id}`}>
                    <motion.div
                        data-tip-delay={500}
                        data-tip={`Image captured by ${metadata.image?.author}`}
                        data-place="right"
                        className="article-image-container open"
                        style={{ ...style, backgroundColor: !metadata.image ? metadata.backgroundColor : 'black' }}
                        layoutId={`article-image-container-${metadata.id}`}>
                        <div className="article-scrim-container" />
                        {/* eslint-disable-next-line*/}
                        <img
                            alt={metadata.image?.alt}
                            style={{ opacity: metadata.brightness }}
                            src={metadata.coverImage} />
                    </motion.div>
                    <motion.div
                        style={style}
                        className="article-title-container open"
                        layoutId={`article-title-container-${metadata.id}`}>
                        <h2>{metadata.title}</h2>
                    </motion.div>
                    <motion.div
                        initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} 
                        transition={{delay: 0.5}}
                        className={`article-close-button open umami--click--close:${metadata.id}`}>
                        <Link href="/"><i className="fas fa-times-circle clickable"></i></Link>
                    </motion.div>
                    <motion.div
                        style={style}
                        className="article-metadata-container"
                        layoutId={`article-metadata-container-${metadata.id}`}>
                        <motion.h3 data-tip={metadata.published} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.5, duration: 0.3}}><i className={`fas fa-${metadata.category}`}/></motion.h3>
                        <motion.h3 data-tip={metadata.published} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.5, duration: 0.3}}>{moment(metadata.published).format("DD/MM/YYYY")}</motion.h3>
                    </motion.div>
                    <motion.div transition={{delay: 0.3}} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="article-body tldr" >
                            {metadata.description && <div>
                                <h4 style={{color: metadata.color}}>tl;dr</h4>
                                <span>{metadata.description}</span>
                            </div>}
                        </div>
                        <div className="article-body text" >
                            <ReactMarkdown
                                escapeHtml={false}
                                source={content}
                                renderers={{ code: ({ language, value }) => <CodeBlock language={language} value={value} />}}
                            />
                        </div>
                        <div className="article-body metadata">
                            <div >

                                <span data-tip={moment(metadata.published).toLocaleString()}>Published {moment(metadata.published).format("dddd, MMMM Do YYYY, h:mm:ss a")}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </article>
        </>
    )
}

export default Reader;
