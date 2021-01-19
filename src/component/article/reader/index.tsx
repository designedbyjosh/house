import React from 'react';
import { motion } from 'framer-motion';
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import './reader.scss';
import '../article.scss';

type ReaderProps = {
    article: Article,
}

/**
 * A reader is an expanded version of the thumbnail (@see /src/component/article/thumbnail) that now has the article's content in it 
 * 
 * @author Josh <code@josh.house>
 */
function Reader({ article }: ReaderProps) {

    if (article === null || article === undefined) return <Redirect to="/" />;

    const { content, metadata } = article;
    const Content = content;
    let Override = metadata.thumbnail;

    return (
        <div className="viewport">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2, delay: 0.15 }}
                style={{ pointerEvents: "auto" }}
                className="overlay">
                <Link to="/" className="expanded-fixed" />
            </motion.div>
            <article className="article-container open">
                <motion.div
                    className="article-content open"
                    layoutId={`article-container-${metadata.id}`}>
                    {Override 
                    ? <Override opened /> 
                    : <>
                    <motion.div
                        data-tip-delay={500}
                        data-tip={`Image captured by ${metadata.image?.author}`}
                        data-place="right"
                        className="article-image-container open"
                        style={{ backgroundColor: !metadata.image ? metadata.backgroundColor : 'black' }}
                        layoutId={`article-image-container-${metadata.id}`}>
                        {/* eslint-disable-next-line*/}
                        <img
                            alt={metadata.image?.alt}
                            style={{ opacity: metadata.brightness }}
                            src={metadata.image?.src!} />
                    </motion.div>
                    <motion.div
                        className="article-title-container open"
                        layoutId={`article-title-container-${metadata.id}`}>
                        <h2>{metadata.title}</h2>
                    </motion.div>
                    <motion.div
                        className="article-close-button open">
                        <i className="fas fa-times-circle clickable"><Link className="expanded-absolute"to="/" /></i>
                    </motion.div>
                    <motion.div
                        className="article-metadata-container open"
                        layoutId={`article-metadata-container-${metadata.id}`}>
                        <motion.h3 data-tip={metadata.published} initial={{opacity: 0, y: 10}} animate={{opacity: metadata.showMetadata ? 1 : 0, y: 0}} transition={{delay: 0.5, duration: 0.3}}>{moment(metadata.published).fromNow()}</motion.h3>
                        <motion.h3 data-tip={metadata.published} initial={{opacity: 0, y: 10}} animate={{opacity: metadata.showMetadata ? 1 : 0, y: 0}} transition={{delay: 0.5, duration: 0.3}} style={{color: metadata.color}}>#{metadata.category.name}</motion.h3>
                        <h3 data-tip={metadata.category}><i className={metadata.category.icon}></i></h3>
                    </motion.div>
                    </>}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {metadata.tldr && <div className="article-body tldr" >
                            <div>
                                <h4 style={{color: metadata.color}}>tl;dr</h4>
                                <span>{metadata.tldr}</span>
                            </div>
                        </div>}
                        <div className="article-body text" >
                            {<Content />}
                        </div>
                        <div className="article-body metadata">
                            <div>
                                <span className="reference">Cover {metadata.image?.author ? "by" : "is"} {metadata.image?.author || metadata.backgroundColor}</span>
                            </div>
                            <div style={{opacity: metadata.showMetadata ? 1 : 0}} >
                                <span data-tip={moment(metadata.published).toLocaleString()}>Published {moment(metadata.published).fromNow()}</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </article>
        </div>
    )
}

export default Reader;
