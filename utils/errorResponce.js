//here we handle the error response


class errorResponce extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = errorResponce;