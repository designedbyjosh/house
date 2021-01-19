import reflectance from './reflectance';

export const posts = {
    [reflectance.metadata.id]: reflectance
} as Articles;

export const idToArticle = (id: string): Article => { return posts[id]};

