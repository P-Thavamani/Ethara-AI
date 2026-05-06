const prisma = require('../config/prisma');

const getDashboardStats = async (userId) => {
  const now = new Date();

  // Get all projects the user is a member of
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  const [totalTasks, completedTasks, overdueTasks, inProgressTasks, myTasks, recentActivity] = await Promise.all([
    prisma.task.count({ where: { projectId: { in: projectIds } } }),
    prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
    prisma.task.count({
      where: { projectId: { in: projectIds }, dueDate: { lt: now }, status: { not: 'DONE' } },
    }),
    // Fixed: actually count IN_PROGRESS tasks instead of (total - completed)
    prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
    prisma.task.findMany({
      where: { assigneeId: userId, status: { not: 'DONE' } },
      select: {
        id: true, title: true, status: true, priority: true, dueDate: true, projectId: true,
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.activityLog.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        id: true, action: true, createdAt: true, meta: true,
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  // Workload distribution per member
  const workload = await prisma.task.groupBy({
    by: ['assigneeId'],
    where: { projectId: { in: projectIds }, assigneeId: { not: null }, status: { not: 'DONE' } },
    _count: { id: true },
  });

  const assigneeIds = workload.map((w) => w.assigneeId).filter(Boolean);
  const assignees = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, avatar: true },
  });

  const workloadData = workload.map((w) => ({
    user: assignees.find((a) => a.id === w.assigneeId),
    taskCount: w._count.id,
  }));

  return {
    stats: { totalTasks, completedTasks, overdueTasks, inProgressTasks },
    myTasks,
    recentActivity,
    workload: workloadData,
  };
};

module.exports = { getDashboardStats };
