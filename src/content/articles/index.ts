import reflectance from './reflectance';
import sundance from './sundance';

export const posts = {
    [reflectance.metadata.id]: reflectance
} as Articles;

export const projects = {
    [sundance.metadata.id]: sundance
} as Articles;

export const idToArticle = (id: string): Article => { return {...posts, ...projects}[id]};

