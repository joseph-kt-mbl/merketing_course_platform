// Validate request body using schema

export default (schema) => (req, res, next) => {
  // validate req.body
  // if error -> send response
  next();
};

