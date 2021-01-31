import React from 'react';

type ImageProps = {
    src: string,
    caption: string,
    reference?: string
}

/**
 * An image is one that is embedded into an article and has a caption and hoverability component to it
 * 
 * @author Josh <code@josh.house>
 */
function Image({ src, caption, reference }: ImageProps) {

    return (
        <>
            <img src={src} alt={caption} />
            <p className="caption">
            <span>{caption}</span>
            {reference && <span ><a href={reference}> (source)</a></span>}
            </p>
        </>
    )
}

export default Image;
