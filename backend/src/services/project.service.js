const prisma = require('../config/prisma');

const createProject = async ({ name, description, userId }) => {
  const project = await prisma.project.create({
    data: {
      name,
      description,
      createdById: userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } },
  });

  await prisma.activityLog.create({
    data: { action: 'PROJECT_CREATED', userId, projectId: project.id, meta: { projectName: name } },
  });

  return project;
};

const getUserProjects = async (userId) => {
  return prisma.project.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

const getProjectById = async (projectId) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      _count: { select: { tasks: true } },
    },
  });
};

// Whitelist only allowed fields — prevents mass assignment (createdById takeover)
const updateProject = async (projectId, data) => {
  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name;
  if (data.description !== undefined) allowed.description = data.description;
  if (data.status !== undefined) allowed.status = data.status;

  return prisma.project.update({ where: { id: projectId }, data: allowed });
};

const deleteProject = async (projectId) => {
  return prisma.project.delete({ where: { id: projectId } });
};

const addMember = async ({ projectId, email, role, actorId }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('User not found with that email');
    err.statusCode = 404;
    throw err;
  }

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
  });
  if (existing) {
    const err = new Error('User is already a member');
    err.statusCode = 409;
    throw err;
  }

  const member = await prisma.projectMember.create({
    data: { userId: user.id, projectId, role: role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });

  await prisma.activityLog.create({
    data: { action: 'MEMBER_ADDED', userId: actorId, projectId, meta: { memberEmail: email } },
  });

  return member;
};

// Prevent removing the last admin — would orphan the project
const removeMember = async ({ projectId, memberId, actorId }) => {
  // Check if the member being removed is an admin
  const memberToRemove = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: memberId, projectId } },
  });

  if (!memberToRemove) {
    const err = new Error('Member not found');
    err.statusCode = 404;
    throw err;
  }

  if (memberToRemove.role === 'ADMIN') {
    // Count remaining admins
    const adminCount = await prisma.projectMember.count({
      where: { projectId, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      const err = new Error('Cannot remove the last admin. Transfer admin role to another member first.');
      err.statusCode = 400;
      throw err;
    }
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId: memberId, projectId } },
  });

  await prisma.activityLog.create({
    data: { action: 'MEMBER_REMOVED', userId: actorId, projectId, meta: { removedUserId: memberId } },
  });
};

const updateMemberRole = async ({ projectId, memberId, role }) => {
  // If demoting an admin, ensure they're not the last one
  if (role !== 'ADMIN') {
    const currentMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberId, projectId } },
    });
    if (currentMember?.role === 'ADMIN') {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        const err = new Error('Cannot demote the last admin. Promote another member first.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  return prisma.projectMember.update({
    where: { userId_projectId: { userId: memberId, projectId } },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });
};

module.exports = { createProject, getUserProjects, getProjectById, updateProject, deleteProject, addMember, removeMember, updateMemberRole };
