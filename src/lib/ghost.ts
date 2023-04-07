import GhostContentAPI from "@tryghost/content-api";

// Create API instance with site credentials
const api = new GhostContentAPI({
  url: 'https://blog.josh.house',
  key: 'eb96af1599ca124e045fbb22f5',
  version: "v5.0"
});

export async function getPosts() {
    return await api.posts
      .browse({
        limit: "all",
        filter: "tags:[photo]"
      })
      .catch(err => {
        console.error(err);
      });
  }