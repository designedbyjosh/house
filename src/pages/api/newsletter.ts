import { NextApiRequest, NextApiResponse } from "next";
const jwt = require('jsonwebtoken');

const url = 'https://blog.josh.house'
const adminToken = process.env.GHOST_ADMIN_TOKEN

export default async function (req: NextApiRequest, res: NextApiResponse) {

    // Retrieve the email parameter from the request query
    const { email } = req.query;

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
    const [id, secret] = adminToken!.split(':');

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

    // Check if the request was successful
    if (apiResponse.ok) {
      res.status(200).json({ message: `Successfully signed up ${email}` });
    } else {
        res.status(400).json({ message: `Failed to sign up ${email}` });
    }
}