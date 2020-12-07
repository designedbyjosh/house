interface ArticleMetadata {
    id: string,
    category: string,
    title: string,
    focusIndex?: number, //This is the offset for an image if supplied
    backgroundColor: string,
    image?: ReferencedImage,
    brightness?: number,
    published: any,
    tldr?: string
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