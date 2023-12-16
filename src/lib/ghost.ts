import GhostContentAPI, { Nullable } from "@tryghost/content-api";
const jwt = require('jsonwebtoken');

const url = 'https://blog.josh.house'
const contentToken = process.env.GHOST_CONTENT_TOKEN || 'eb96af1599ca124e045fbb22f5'
const adminToken = process.env.GHOST_ADMIN_TOKEN || '642f8ac76964500001c07c54:65241921fd0390403a885a4f4879171391b18a7dc24cefcdb5e2a710cd96232b'

console.log(adminToken)
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
    // Your request body
    const requestBody = {
      members: [
        {
          email: email,
          "newsletters": [
            {
              "id": "642f89466964500001c07a3d",
              "uuid": "b8c2b5b6-6d42-47cd-9d09-9749c06e6111",
              "name": "Written by Josh",
              "slug": "default-newsletter",
              "status": "active",
              "visibility": "members",
              "subscribe_on_signup": true,
            }]
        },
      ],
    };

    // Split the key into ID and SECRET
    const [id, secret] = adminToken.split(':');

    // Create the token (including decoding secret)
    const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
      keyid: id,
      algorithm: 'HS256',
      expiresIn: '5m',
      audience: `/admin/`
    });

    // Send POST request to the API
    const apiResponse = await fetch(url + "/ghost/api/admin/members/?include=newsletters%2Clabels", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Ghost ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(apiResponse)

    // Check if the request was successful
    if (apiResponse.ok) {
      console.log("success")
      const responseData = await apiResponse.json();
      console.log(responseData)
      resolve("Successfully signed up user")
    } else {
      // Handle error responses
      const errorData = await apiResponse.json();
      console.log(errorData)
      reject(apiResponse.statusText)
    }
  })
}