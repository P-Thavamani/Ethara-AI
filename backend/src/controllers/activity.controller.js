const prisma = require('../config/prisma');
const { success } = require('../utils/response');

const getProjectActivity = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { projectId: req.params.projectId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return success(res, logs);
  } catch (err) { next(err); }
};

module.exports = { getProjectActivity };
