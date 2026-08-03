const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Server Error',
    status: err.status || 500
  };

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Prisma errors
  if (err.code === 'P2002') {
    error.message = 'Duplicate entry';
    error.status = 409;
  }
  if (err.code === 'P2025') {
    error.message = 'Record not found';
    error.status = 404;
  }

  res.status(error.status).json(error);
};

module.exports = errorHandler;