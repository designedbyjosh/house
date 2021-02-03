import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fade } from '../../../styles/animations/transitions';
import Link from 'next/link';

type ThumbnailProps = {
    metadata: ArticleMetadata,
    style?: React.CSSProperties | undefined
}

/**
 * A thumbnail is part of the article component and is rendered as part of a grid view (@see src/component/grid)
 * 
 * @author Josh <code@josh.house>
 */
function Thumbnail({ metadata, style }: ThumbnailProps) {

    return (
            <motion.li
                key={`grid-${metadata.id}`}
                variants={fade}
                className={`thumbnail`}>
                <Link
                        href={`/${metadata.type}/${metadata.id}`}>
                <motion.div
                    style={style}
                    key={`article-container-${metadata.id}`}
                    className={`article-container umami--mouseover--thumbnail:${metadata.id} umami--click--thumbnail:${metadata.id}`}>
                    <motion.div
                        className="article-content"
                        layoutId={`article-container-${metadata.id}`}>
                        <motion.div
                            className="article-image-container"
                            layoutId={`article-image-container-${metadata.id}`}
                            style={{ ...style, backgroundColor: !metadata.image ? metadata.backgroundColor : 'black', left: -metadata.focusIndex! }}>
                            <img
                                src={metadata.coverImage}
                                style={{ opacity: metadata.brightness! }}
                                alt="" />
                        </motion.div>
                        <motion.div
                            style={style}
                            className="article-title-container"
                            layoutId={`article-title-container-${metadata.id}`}>
                            <h2>{metadata.title}</h2>
                        </motion.div>
                        <motion.div
                            style={style}
                            className="article-metadata-container"
                            layoutId={`article-metadata-container-${metadata.id}`}>
                            <h2><i className={`fas fa-${metadata.category}`}></i></h2>
                        </motion.div>
                    </motion.div>
                </motion.div>
                </Link>


        </motion.li>
    )
}

export default Thumbnail;
