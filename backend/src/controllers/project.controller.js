const projectService = require('../services/project.service');
const { success, error } = require('../utils/response');

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject({ ...req.body, userId: req.user.id });
    return success(res, project, 'Project created', 201);
  } catch (err) { next(err); }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user.id);
    return success(res, projects);
  } catch (err) { next(err); }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    if (!project) return error(res, 'Project not found', 404);
    return success(res, project);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.body);
    return success(res, project, 'Project updated');
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.projectId);
    return success(res, null, 'Project deleted');
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const member = await projectService.addMember({
      projectId: req.params.projectId,
      email: req.body.email,
      role: req.body.role,
      actorId: req.user.id,
    });
    return success(res, member, 'Member added', 201);
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    await projectService.removeMember({
      projectId: req.params.projectId,
      memberId: req.params.memberId,
      actorId: req.user.id,
    });
    return success(res, null, 'Member removed');
  } catch (err) { next(err); }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const member = await projectService.updateMemberRole({
      projectId: req.params.projectId,
      memberId: req.params.memberId,
      role: req.body.role,
    });
    return success(res, member, 'Role updated');
  } catch (err) { next(err); }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember, updateMemberRole };
