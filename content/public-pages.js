import articles from './articles.json' with {type:'json'};
import photos from './legacy-photo-routes.json' with {type:'json'};
import {projects} from './projects.mjs';
export const publicPages = new Set(['/', '/articles/', '/photography/', '/music/', '/projects/', ...projects.map(p=>`/projects/${p.slug}/`), ...articles.flatMap(a=>[`/articles/${a.slug}/`, `/photography/${a.slug}/`]), ...photos.map(slug=>`/photography/${slug}/`)]);
