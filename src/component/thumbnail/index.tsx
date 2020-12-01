import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './thumbnail.scss';

type ThumbnailProps = {
    title?: string,
    subtitle?: string,
    backgroundColor?: string,
    primaryColor?: string,
    secondaryColor?: string,
    id?: string,
    selected: boolean
}


function Thumbnail({ title, subtitle, backgroundColor, primaryColor, secondaryColor, id, selected }: ThumbnailProps) {

    const listItem = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    };

    return (
        <li className='thumbnail'>
            <div className="thumbnail-container">
                <motion.div className="thumbnail-content" layoutId={`thumbnail-container-${id}`}>
                    <motion.div
                        initial={{scale: 1}}
                        whileHover={{scale: 1.05}}
                        className="thumbnail-image-container"
                        layoutId={`thumbnail-image-container-${id}`}
                    >
                        <img className="card-image" src={`https://i.pinimg.com/originals/b8/7f/92/b87f92659e1b862ef0212086e6af7efc.jpg`} alt="" />
                    </motion.div>
                    <motion.div
                        className="thumbnail-title-container"
                        layoutId={`thumbnail-title-container-${id}`}
                    >
                        <h2>{title}</h2>
                    </motion.div>
                </motion.div>
            </div>
            <Link to={`/article/${id}`} className={`open-link`} />
        </li>
    )
}

export default Thumbnail;
