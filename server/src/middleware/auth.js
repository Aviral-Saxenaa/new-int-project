import { ApiError } from './errorHandler.js';
import { getUserByToken } from '../services/auth.service.js';

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const session = token ? getUserByToken(token) : null;
  if (!session) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  req.user = session;
  return next();
};
