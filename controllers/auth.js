/**
 * @module controllers/auth
 * @description
 * Authentication middleware for protected routes. Exposes a Fastify pre-handler
 * that extracts the bearer token from the `token` request header, verifies it
 * against `jwtPrivateKey`, and attaches the decoded payload to `request.user`.
 * On a missing or invalid token it short-circuits the request with a 400
 * response instructing the client to re-authenticate.
 *
 * Exposed handlers:
 * - {@link module:controllers/auth.getToken}  Verify the request JWT and populate `request.user`.
 */

const jwt = require("jsonwebtoken");
const config = require("config");
require("dotenv").config();

exports.getToken = (request, reply, done) => {
  const token = request.headers["token"];
  if (!token) {
    const response = {
      status_code: 400,
      status: false,
      message:
        "Access denied. No token provided. Please logout and login again",
    };
    done(response);
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    request.user = decoded;
    done();
  } catch (ex) {
    const response = {
      status_code: 400,
      status: false,
      message:
        "Access denied. No token provided. Please logout and login again",
    };
    done(response);
  }
};
