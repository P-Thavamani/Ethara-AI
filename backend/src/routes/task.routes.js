const router = require('express').Router({ mergeParams: true });
const multer = require('multer');
const ctrl = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireProjectMember, requireProjectAdmin } = require('../middlewares/rbac.middleware');
const { taskRules, statusRules, handleValidation } = require('../validators/task.validator');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(authenticate);
router.use(requireProjectMember);

router.get('/', ctrl.getTasks);
router.post('/', taskRules, handleValidation, ctrl.createTask);

router.get('/:taskId', ctrl.getTask);
router.put('/:taskId', taskRules, handleValidation, ctrl.updateTask);
router.patch('/:taskId/status', statusRules, handleValidation, ctrl.updateTaskStatus);
router.delete('/:taskId', ctrl.deleteTask);

router.get('/:taskId/comments', ctrl.getComments);
router.post('/:taskId/comments', ctrl.addComment);

router.get('/:taskId/attachments', ctrl.getAttachments);
router.post('/:taskId/attachments', upload.single('file'), ctrl.addAttachment);

module.exports = router;
