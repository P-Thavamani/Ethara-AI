const router = require('express').Router();
const ctrl = require('../controllers/project.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireProjectAdmin, requireProjectMember } = require('../middlewares/rbac.middleware');
const { projectRules, memberRoleRules, handleValidation } = require('../validators/project.validator');

router.use(authenticate);

router.get('/', ctrl.getProjects);
router.post('/', projectRules, handleValidation, ctrl.createProject);

router.get('/:projectId', requireProjectMember, ctrl.getProject);
router.put('/:projectId', requireProjectAdmin, projectRules, handleValidation, ctrl.updateProject);
router.delete('/:projectId', requireProjectAdmin, ctrl.deleteProject);

// Member management (admin only)
router.post('/:projectId/members', requireProjectAdmin, ctrl.addMember);
router.delete('/:projectId/members/:memberId', requireProjectAdmin, ctrl.removeMember);
router.patch('/:projectId/members/:memberId/role', requireProjectAdmin, memberRoleRules, handleValidation, ctrl.updateMemberRole);

module.exports = router;
