import GhostContentAPI, { Nullable } from "@tryghost/content-api";
const jwt = require('jsonwebtoken');

const url = 'https://blog.josh.house'
const contentToken = process.env.GHOST_CONTENT_TOKEN

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