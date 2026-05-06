const taskService = require('../services/task.service');
const storageService = require('../services/storage.service');
const { success, error } = require('../utils/response');

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, assigneeId } = req.body;
    const task = await taskService.createTask({
      title,
      description,
      priority,
      status,
      dueDate,
      assigneeId,
      projectId: req.params.projectId,
      createdById: req.user.id,
    });
    
    req.app.get('io').to(`project:${req.params.projectId}`).emit('taskCreated', task);
    
    return success(res, task, 'Task created', 201);
  } catch (err) { next(err); }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getProjectTasks(req.params.projectId, req.query);
    return success(res, tasks);
  } catch (err) { next(err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    if (!task) return error(res, 'Task not found', 404);
    return success(res, task);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.body, req.user.id);
    req.app.get('io').to(`project:${req.params.projectId}`).emit('taskUpdated', task);
    return success(res, task, 'Task updated');
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.taskId, req.user.id);
    req.app.get('io').to(`project:${req.params.projectId}`).emit('taskDeleted', req.params.taskId);
    return success(res, null, 'Task deleted');
  } catch (err) { next(err); }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.taskId, req.body.status, req.user.id);
    req.app.get('io').to(`project:${req.params.projectId}`).emit('taskUpdated', task);
    return success(res, task, 'Status updated');
  } catch (err) { next(err); }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await taskService.getComments(req.params.taskId);
    return success(res, comments);
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    if (!req.body.content) return error(res, 'Content is required', 400);
    const comment = await taskService.addComment(req.params.taskId, req.user.id, req.body.content);
    return success(res, comment, 'Comment added', 201);
  } catch (err) { next(err); }
};

const getAttachments = async (req, res, next) => {
  try {
    const attachments = await taskService.getAttachments(req.params.taskId);
    return success(res, attachments);
  } catch (err) { next(err); }
};

const addAttachment = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'File is required', 400);

    const { url, fileName } = await storageService.uploadFile(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype
    );

    const attachment = await taskService.addAttachment(
      req.params.taskId, 
      req.user.id, 
      url, 
      fileName, 
      req.file.size
    );

    return success(res, attachment, 'Attachment uploaded', 201);
  } catch (err) { next(err); }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, updateTaskStatus, getComments, addComment, getAttachments, addAttachment };
