interface ThumbnailProps {
    opened?: boolean
}

interface ArticleMetadata {
    id: string,
    category: Category,
    title: string,
    focusIndex?: number, //This is the offset for an image if supplied
    backgroundColor: string,
    image?: ReferencedImage,
    brightness?: number,
    published: any,
    tldr?: string,
    color: string,
    showMetadata: boolean,
    thumbnail?: React.FC<ThumbnailProps>,
    type: string,
    wide?: boolean
}

interface Category {
    name: string,
    icon: string
}

interface ReferencedImage {
    src: string
    author: string,
    alt: string
}

type Article = {
    metadata: ArticleMetadata,
    content: React.FC
}

interface Articles {
    [key: string]: Article
}

interface Projects extends Articles {
    
}