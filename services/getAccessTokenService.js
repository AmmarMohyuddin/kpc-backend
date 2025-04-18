const axios = require("axios");

async function getAccessToken() {
  const tokenUrl =
    "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/oauth/token";

  const clientId = "MmBHDqIdBijG0kC9u07Qgg..";
  const clientSecret = "0fFo6yiZ8Eu028J3dsJXJg..";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Failed to fetch access token:",
      error.response?.data || error.message
    );
    throw new Error("Access token request failed");
  }
}

module.exports = getAccessToken;
