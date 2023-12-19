import GhostContentAPI, { Nullable, PostOrPage } from "@tryghost/content-api";
const jwt = require('jsonwebtoken');

const url = 'https://blog.josh.house'
const contentToken = process.env.GHOST_CONTENT_TOKEN


export interface PostOrPageWithLocation extends PostOrPage {
  lat?: string,
  long?: string,
  zoom?: string
}

// Create API instance with site credentials
const api = new GhostContentAPI({
  url: url!,
  key: contentToken!,
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

export function ExtractTravelMetadata(post: PostOrPage) {

    // Find matches
    const re = /([a-zA-Z!]+:\s*[" ]?([-a-z0-9\s.]+)[" $])/gi
    const matches = post.codeinjection_head?.match(re)

    // This is horrible, we should change this
    try {
      const lat = matches![0].split(":")[1].replaceAll('"', '')
      const long = matches![1].split(":")[1].replaceAll('"', '')
      const zoom = matches![2].split(":")[1].replaceAll('"', '')
      return {...post, lat, long, zoom} as PostOrPageWithLocation
    }
    catch {
      return {...post} as PostOrPageWithLocation
    }
    
}

export async function getLatestTravelPost() : Promise<PostOrPageWithLocation> {
  let posts = await api.posts
    .browse({
      limit: "1",
      filter: "tags:[travel]"
    })
    .catch(err => {
      console.error(err);
    })

    return ExtractTravelMetadata((posts as any)[0])
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

export async function getLatestPost() {
  let posts = await api.posts
    .browse({
      limit: "1",
      filter: "tags:[blog]"
    })
    .catch(err => {
      console.error(err);
    });

  return (posts as any)[0]
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

export async function SubscribeToNewsletter(email: string) {

  return new Promise(async (resolve, reject) => {
    
      try {
        await fetch(`/api/newsletter/subscribe?email=${email}`);
        resolve("Successfully signed up user")
      } catch (error) {
        console.error('Error fetching data:', error);
        reject()
      }

  })
}