const querystring = require("querystring");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.OCI_CLIENT_ID;
const CLIENT_SECRET = process.env.OCI_CLIENT_SECRET;
const IDCS_DOMAIN = process.env.OCI_IDCS_DOMAIN;
const POST_LOGOUT_REDIRECT_URI = process.env.OCI_POST_LOGOUT_REDIRECT_URI || `https://localhost:${PORT}`;

async function ocilogout(req, res) {
  try {
    // Get the id_token from query parameter or cookies
    const idToken = req.query.id_token || req.cookies.id_token || "";

    if (!idToken) {
      return errorResponse(res, 400, "ID token is required for logout");
    }

    // Build logout URL
    const logoutUrl =
      `${IDCS_DOMAIN}/oauth2/v1/userlogout?` +
      querystring.stringify({
        id_token_hint: idToken,
        post_logout_redirect_uri: POST_LOGOUT_REDIRECT_URI,
      });

    console.log("REDIRECT URL:", logoutUrl);
    // res.redirect(logoutUrl);
    return successResponse(res, 200, "Logout URL generated successfully", {
      logoutUrl,
    });
  } catch (error) {
    console.error("Error during OCI logout:", error);
    return errorResponse(res, 500, "An error occurred during logout.");
  }
}

module.exports = ocilogout;
