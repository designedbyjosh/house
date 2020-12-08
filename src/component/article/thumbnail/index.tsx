import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fade } from '../../../styling/animations/transitions';
import './thumbnail.scss';
import '../article.scss';

type ThumbnailProps = {
    metadata: ArticleMetadata
}

/**
 * A thumbnail is part of the article component and is rendered as part of a grid view (@see src/component/grid)
 * 
 * @author Josh <code@josh.house>
 */
function Thumbnail({ metadata }: ThumbnailProps) {

    return (
        <motion.li
            variants={fade}
            className='thumbnail'>
            <motion.div
                key={`article-container-${metadata.id}`}
                className="article-container">
                <motion.div
                    className="article-content"
                    layoutId={`article-container-${metadata.id}`}>
                    <motion.div
                        className="article-image-container"
                        layoutId={`article-image-container-${metadata.id}`}
                        style={{ backgroundColor: !metadata.image ? metadata.backgroundColor : 'black', left: -metadata.focusIndex! }}>
                        <img
                            src={metadata.image?.src!}
                            style={{ opacity: metadata.brightness! }}
                            alt="" />
                    </motion.div>
                    <motion.div
                        className="article-title-container"
                        layoutId={`article-title-container-${metadata.id}`}>
                        <h2>{metadata.title}</h2>
                    </motion.div>
                    <motion.div
                        className="article-metadata-container"
                        layoutId={`article-metadata-container-${metadata.id}`}>
                        <h2><i className={metadata.category.icon}></i></h2>
                    </motion.div>
                </motion.div>
                <Link
                    className={`expanded-absolute`} 
                    to={`/article/${metadata.id}`}/>
            </motion.div>

        </motion.li>
    )
}

export default Thumbnail;
