const axios = require("axios");
const jwt = require("jsonwebtoken");
const querystring = require("querystring");
const Salesperson = require("../../../../models/salesperson");
const User = require("../../../../models/user");
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

    console.log("[OCI] Callback hit", {
      originalUrl: req.originalUrl,
      queryKeys: Object.keys(req.query || {}),
      codeLength: code ? code.length : 0,
      referer: req.headers?.referer,
      cookieLength: req.headers && req.headers.cookie ? req.headers.cookie.length : 0,
      userAgent: req.headers?.['user-agent'],
    });

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

    try {
      console.log("[OCI] Token response received", {
        status: tokenResponse.status,
        dataKeys: Object.keys(tokenResponse.data || {}),
        idTokenLength: tokenResponse?.data?.id_token ? tokenResponse.data.id_token.length : 0,
        headersSize: (() => {
          try { return JSON.stringify(tokenResponse.headers || {}).length; } catch { return -1; }
        })(),
      });
    } catch (logErr) {
      console.log("[OCI] Failed to log token response summary:", logErr?.message || logErr);
    }

    const { id_token } = tokenResponse.data;

    // Decode ID token (JWT) to get user info
    const decoded = jwt.decode(id_token);

    console.log("=== Decoded User Info ===");
    console.log(JSON.stringify(decoded, null, 2));

    console.log("[OCI] Decoded claims summary", {
      sub: decoded?.sub,
      preferred_username: decoded?.preferred_username,
      email: decoded?.email,
      name: decoded?.user_displayname || `${decoded?.given_name || ""} ${decoded?.family_name || ""}`.trim(),
    });

    // Check if employee_number in salespersons table matches with the "sub" key
    const { sub } = decoded;

    if (!sub) {
      return errorResponse(res, 400, "User ID not found in token");
    }

    // Find salesperson by employee_number
    console.log("[OCI] Looking up salesperson by employee_number (sub)", { sub });
    const salesPerson = await Salesperson.findOne({ employee_number: sub });
    const admin = await User.findOne({ person_number: sub, role: "admin" });

    if (!salesPerson  && !admin) {
      // Encode error data and redirect to frontend
      const errorData = {
        success: false,
        message: "Sales person or admin not found",
      };
      const errorJson = JSON.stringify(errorData);
      const encodedData = Buffer.from(errorJson).toString("base64");
      console.log("[OCI] Salesperson or admin not found; redirecting with error", {
        jsonBytes: Buffer.byteLength(errorJson, "utf8"),
        base64Bytes: Buffer.byteLength(encodedData, "utf8"),
      });
      res.redirect(
        `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
      );
      return;
    }
    else {
      console.log("[OCI] Salesperson found", { salesPerson });
    }

    // Prepare user info from Oracle token
    const userInfo = {
      username: decoded.preferred_username || decoded.sub,
      name:
        decoded.user_displayname ||
        `${decoded.given_name || ""} ${decoded.family_name || ""}`.trim(),
      email: decoded.email || "N/A",
      salesPerson: salesPerson,
      admin: admin,
    };

    // Note: cookies are now handled by frontend via localStorage

    // Prepare response data
    const responseData = {
      success: true,
      message: "Successfully authenticated with Oracle Identity Cloud",
      data: {
        salesPerson,
        id_token: id_token,
        user_info: userInfo,
      },
    };

    // Encode the response data as base64 to pass in URL
    const responseJson = JSON.stringify(responseData);

    // print responseData
    console.log("[OCI] Response data", JSON.stringify(responseData, null, 2));

    const encodedData = Buffer.from(responseJson).toString("base64");
    console.log("[OCI] Success redirect payload sizes", {
      idTokenLength: id_token ? id_token.length : 0,
      jsonBytes: Buffer.byteLength(responseJson, "utf8"),
      base64Bytes: Buffer.byteLength(encodedData, "utf8"),
    });

    // print encodedData
    console.log("[OCI] Encoded data", encodedData);

    // Redirect to frontend kwith the data as a query parameter
    // res.redirect(
    //   `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
    // );

    return successResponse(res, 200, "Successfully authenticated with Oracle Identity Cloud", {
      salesPerson,
      admin,
      id_token: id_token,
      user_info: userInfo,
    });
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

    const errorJsonStr = JSON.stringify(errorData);
    const encodedData = Buffer.from(errorJsonStr).toString("base64");
    console.log("[OCI] Error redirect payload sizes", {
      jsonBytes: Buffer.byteLength(errorJsonStr, "utf8"),
      base64Bytes: Buffer.byteLength(encodedData, "utf8"),
      axiosStatus: error?.response?.status,
      axiosDataKeys: error?.response?.data ? Object.keys(error.response.data) : [],
    });

    // Redirect to frontend with error
    res.redirect(
      `${FRONTEND_URL}/auth/oracle/callback?response=${encodedData}`
    );
  }
}

module.exports = ocicallback;
