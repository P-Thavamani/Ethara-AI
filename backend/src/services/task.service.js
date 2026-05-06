const prisma = require('../config/prisma');

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  createdBy: { select: { id: true, name: true, email: true, avatar: true } },
};

const createTask = async ({ title, description, priority, status, dueDate, assigneeId, projectId, createdById }) => {
  const task = await prisma.task.create({
    data: { title, description, priority, status, dueDate: dueDate ? new Date(dueDate) : null, assigneeId, projectId, createdById },
    include: taskInclude,
  });

  await prisma.activityLog.create({
    data: { action: 'TASK_CREATED', userId: createdById, projectId, taskId: task.id, meta: { taskTitle: title } },
  });

  return task;
};

const getProjectTasks = async (projectId, filters = {}) => {
  const where = { projectId };
  const conditions = [];

  if (filters.status) conditions.push({ status: filters.status });
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.search) where.title = { contains: filters.search, mode: 'insensitive' };

  if (filters.overdue === 'true') {
    conditions.push({ dueDate: { lt: new Date() } });
    conditions.push({ status: { not: 'DONE' } });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getTaskById = async (taskId) => {
  return prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });
};

// Whitelist allowed fields — prevents mass assignment (projectId/createdById takeover)
const updateTask = async (taskId, data, userId) => {
  const allowed = {};
  if (data.title !== undefined) allowed.title = data.title;
  if (data.description !== undefined) allowed.description = data.description;
  if (data.priority !== undefined) allowed.priority = data.priority;
  if (data.status !== undefined) allowed.status = data.status;
  if (data.dueDate !== undefined) allowed.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.assigneeId !== undefined) allowed.assigneeId = data.assigneeId || null;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: allowed,
    include: taskInclude,
  });

  await prisma.activityLog.create({
    data: { action: 'TASK_UPDATED', userId, projectId: task.projectId, taskId, meta: { changes: Object.keys(allowed) } },
  });

  return task;
};

// Null-safe delete with race condition protection
const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Use a transaction to ensure atomicity
  await prisma.$transaction([
    prisma.task.delete({ where: { id: taskId } }),
    prisma.activityLog.create({
      data: { action: 'TASK_DELETED', userId, projectId: task.projectId, meta: { taskTitle: task.title } },
    }),
  ]);
};

const updateTaskStatus = async (taskId, status, userId) => {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: taskInclude,
  });

  await prisma.activityLog.create({
    data: { action: 'TASK_STATUS_CHANGED', userId, projectId: task.projectId, taskId, meta: { newStatus: status } },
  });

  return task;
};

const getComments = async (taskId) => {
  return prisma.comment.findMany({
    where: { taskId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' }
  });
};

const addComment = async (taskId, userId, content) => {
  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    }
  });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  
  await prisma.activityLog.create({
    data: { action: 'COMMENT_ADDED', userId, projectId: task.projectId, taskId, meta: { commentId: comment.id } },
  });

  return comment;
};

const addAttachment = async (taskId, userId, fileUrl, fileName, fileSize) => {
  const attachment = await prisma.attachment.create({
    data: {
      fileUrl,
      fileName,
      fileSize,
      taskId,
      uploadedById: userId
    },
    include: {
      uploadedBy: { select: { id: true, name: true, avatar: true } }
    }
  });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  
  await prisma.activityLog.create({
    data: { action: 'ATTACHMENT_ADDED', userId, projectId: task.projectId, taskId, meta: { attachmentId: attachment.id, fileName } },
  });

  return attachment;
};

const getAttachments = async (taskId) => {
  return prisma.attachment.findMany({
    where: { taskId },
    include: {
      uploadedBy: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

module.exports = { createTask, getProjectTasks, getTaskById, updateTask, deleteTask, updateTaskStatus, getComments, addComment, addAttachment, getAttachments };
