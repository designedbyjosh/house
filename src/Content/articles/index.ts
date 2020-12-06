import sample from './sample';

const articles = {
    [sample.metadata.id]: sample
} as Articles;

export const idToArticle = (id: string): Article => articles[id];

export default articles;

