const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const { error } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) {
      return error(res, 'Unauthorized: No token provided', 401);
    }

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!user) return error(res, 'Unauthorized: User not found', 401);

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Unauthorized: Invalid token', 401);
  }
};

module.exports = { authenticate };
