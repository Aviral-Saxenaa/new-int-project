export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[server] Unhandled error:', err);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
};

export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
};
