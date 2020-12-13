const errorHandler = (error, req, res, next) => {
  const { status, message } = error;
  res.status(status).json(message);
};

module.exports = errorHandler;
