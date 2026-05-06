const prisma = require('../config/prisma');
const { error } = require('../utils/response');

// Checks if the current user is an ADMIN of the given project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) return error(res, 'Project ID required', 400);

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });

    if (!membership) return error(res, 'Forbidden: Not a project member', 403);
    if (membership.role !== 'ADMIN') return error(res, 'Forbidden: Admin access required', 403);

    req.membership = membership;
    next();
  } catch (err) {
    return error(res, 'Authorization check failed', 500);
  }
};

// Checks if the current user is a member (any role) of the given project
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) return error(res, 'Project ID required', 400);

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } },
    });

    if (!membership) return error(res, 'Forbidden: Not a project member', 403);

    req.membership = membership;
    next();
  } catch (err) {
    return error(res, 'Authorization check failed', 500);
  }
};

module.exports = { requireProjectAdmin, requireProjectMember };
