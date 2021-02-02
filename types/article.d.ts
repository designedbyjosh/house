interface ArticleMetadata {
    id: string,
    category: Category,
    title: string,
    focusIndex?: number, //This is the offset for an image if supplied
    coverImage: string,
    image?: ReferencedImage,
    brightness?: number,
    published: any,
    description?: string,
    color: string
    backgroundColor?: string,
    customLink?: string
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
    content: string
}

interface Articles {
    [key: string]: Article
}