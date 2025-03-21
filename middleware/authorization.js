const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { errorResponse } = require("../utils/response");

async function authorization(req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return errorResponse(
      res,
      401,
      "Access Denied: No authentication token provided."
    );
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_KEY);

    req.user = await User.findOne({ authenticationToken: token });

    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Authentication Failed: No user found with this token."
      );
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        401,
        "Session Expired: Your token has expired. Please log in again."
      );
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(
        res,
        401,
        "Invalid Token: The provided token is not valid."
      );
    }
    return errorResponse(
      res,
      500,
      "Authentication Error: An unexpected error occurred."
    );
  }
}

module.exports = authorization;
