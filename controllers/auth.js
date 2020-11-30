const jwt = require("jsonwebtoken");
const config = require("config");

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
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
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
