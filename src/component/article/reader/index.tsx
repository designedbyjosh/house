import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareAlt, faShareAltSquare } from '@fortawesome/free-solid-svg-icons'
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

    const { content, metadata } = article;
    const Content = content;

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
            <div className="article-container open">
                <motion.div
                    className="article-content open"
                    layoutId={`article-container-${metadata.id}`}>
                    <motion.div
                        data-tip={`Image captured by ${metadata.image?.author}`}
                        data-place="right"
                        className="article-image-container open"
                        style={{ backgroundColor: !metadata.image ? metadata.backgroundColor : 'black' }}
                        layoutId={`article-image-container-${metadata.id}`}>
                        <img
                            alt={metadata.image?.alt}
                            style={{ opacity: metadata.brightness }}
                            src={metadata.image?.URL.toString()} />
                    </motion.div>
                    <motion.div
                        className="article-title-container open"
                        layoutId={`article-title-container-${metadata.id}`}>
                        <h2>{metadata.title}</h2>
                    </motion.div>
                    <div className="article-body text" >
                        {<Content />}
                    </div>
                    <div className="article-body metadata">
                        <div >
                        <span className="reference">Cover by <a href={metadata.image?.URL.toString()}> {metadata.image?.author}</a></span>
                        </div>
                        <div >
                         
                         <span data-tip={moment(metadata.published).toLocaleString()}>Published {moment(metadata.published).fromNow()}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Reader;
