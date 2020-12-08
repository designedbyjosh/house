import reflectance from './reflectance';

const articles = {
    [reflectance.metadata.id]: reflectance
} as Articles;

export const idToArticle = (id: string): Article => articles[id];

export default articles;

