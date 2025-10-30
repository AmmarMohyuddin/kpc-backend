const axios = require("axios");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const Salesperson = require("../../../../models/salesperson");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.OCI_CLIENT_ID;
const CLIENT_SECRET = process.env.OCI_CLIENT_SECRET;
const IDCS_DOMAIN = process.env.OCI_IDCS_DOMAIN;
const REDIRECT_URI = process.env.OCI_REDIRECT_URI || `https://localhost:${PORT}/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function ocicallback(req, res) {
  try {
    const code = req.query.code;

    if (!code) {
      return errorResponse(res, 400, "Authorization code not received");
    }

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      `${IDCS_DOMAIN}/oauth2/v1/token`,
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { id_token } = tokenResponse.data;

    // Decode ID token (JWT) to get user info
    const decoded = jwt.decode(id_token);

    console.log("=== Decoded User Info ===");
    console.log(JSON.stringify(decoded, null, 2));

    // Check if employee_number in salespersons table matches with the "sub" key
    const { sub } = decoded;

    if (!sub) {
      return errorResponse(res, 400, "User ID not found in token");
    }

    // Find salesperson by employee_number
    const salesPerson = await Salesperson.findOne({ employee_number: sub });

    if (!salesPerson) {
      // Encode error data and redirect to frontend
      const errorData = {
        success: false,
        message: "Sales person not found",
      };
      const encodedData = Buffer.from(JSON.stringify(errorData)).toString(
        "base64"
      );
      res.redirect(
        `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
      );
      return;
    }

    // Prepare user info from Oracle token
    const userInfo = {
      username: decoded.preferred_username || decoded.sub,
      name:
        decoded.user_displayname ||
        `${decoded.given_name || ""} ${decoded.family_name || ""}`.trim(),
      email: decoded.email || "N/A",
      salesPerson: salesPerson,
    };

    // Note: cookies are now handled by frontend via localStorage

    // Prepare response data
    const responseData = {
      success: true,
      message: "Successfully authenticated with Oracle Identity Cloud",
      data: {
        salesPerson,
        id_token: id_token,
        // user_info: userInfo,
      },
    };

    // Encode the response data as base64 to pass in URL
    const encodedData = Buffer.from(JSON.stringify(responseData)).toString(
      "base64"
    );

    // Redirect to frontend with the data as a query parameter
    res.redirect(
      `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
    );
  } catch (error) {
    console.error(
      "Error in OCI callback:",
      error.response?.data || error.message
    );

    // Encode error data
    const errorData = {
      success: false,
      message: error.response?.data?.message || "Authentication failed",
      error: error.message,
    };

    const encodedData = Buffer.from(JSON.stringify(errorData)).toString(
      "base64"
    );

    // Redirect to frontend with error
    res.redirect(
      `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
    );
  }
}

module.exports = ocicallback;
