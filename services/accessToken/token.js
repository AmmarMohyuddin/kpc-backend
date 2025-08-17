// services/accessToken/token.js
const axios = require("axios");
const qs = require("qs");

let cachedToken = null;
let tokenExpiry = null; // in ms timestamp

async function getAccessToken() {
  const now = Date.now();

  // ✅ If we have a token and it's still valid, return it immediately
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  // No valid token, fetch a new one
  const username = "MmBHDqIdBijG0kC9u07Qgg..";
  const password = "0fFo6yiZ8Eu028J3dsJXJg..";
  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

  const data = qs.stringify({
    grant_type: "client_credentials",
  });

  const config = {
    method: "post",
    url: "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/oauth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    data,
  };

  const response = await axios.request(config);

  cachedToken = response.data.access_token;
  // Oracle gives expiry in seconds → convert to ms & subtract 10 seconds buffer
  tokenExpiry = now + (response.data.expires_in - 10) * 1000;

  console.log("🔑 New access token fetched");

  return cachedToken;
}

module.exports = getAccessToken;
