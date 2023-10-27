import GhostContentAPI, { Nullable } from "@tryghost/content-api";

// Create API instance with site credentials
const api = new GhostContentAPI({
  url: 'https://blog.josh.house',
  key: 'eb96af1599ca124e045fbb22f5',
  version: "v5.0"
});

export async function ReadPost(id: { id: Nullable<string>; } | { slug: Nullable<string>; }) {
  return await api.posts
    .read(id)
    .catch(err => {
      console.error(err);
    });
}

export async function getPhotos() {
  return await api.posts
    .browse({
      include: 'tags',
      limit: "all",
      filter: "tags:[photo]"
    })
    .catch(err => {
      console.error(err);
    });
}

export async function getTravelPosts() {
  return await api.posts
    .browse({
      limit: "all",
      filter: "tags:[travel]"
    })
    .catch(err => {
      console.error(err);
    });
}

export async function getPosts() {
  return await api.posts
    .browse({
      limit: "all",
      filter: "tags:[blog]"
    })
    .catch(err => {
      console.error(err);
    });
}