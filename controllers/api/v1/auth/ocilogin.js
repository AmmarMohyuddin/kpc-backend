const querystring = require("querystring");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.OCI_CLIENT_ID;
const CLIENT_SECRET = process.env.OCI_CLIENT_SECRET;
const IDCS_DOMAIN = process.env.OCI_IDCS_DOMAIN;
const REDIRECT_URI = process.env.OCI_REDIRECT_URI || `https://localhost:${PORT}/callback`;

async function ocilogin(req, res) {
  try {
    const authUrl =
      `${IDCS_DOMAIN}/oauth2/v1/authorize?` +
      querystring.stringify({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: "openid",
      });

    // Return the URL as JSON for frontend to handle
    return successResponse(res, 200, "Oracle authentication URL generated", {
      authUrl,
    });
  } catch (error) {
    console.error("Error initiating OCI login:", error);
    return errorResponse(
      res,
      500,
      "An error occurred during login initialization."
    );
  }
}

module.exports = ocilogin;
