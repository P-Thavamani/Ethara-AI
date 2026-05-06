const router = require('express').Router({ mergeParams: true });
const { getProjectActivity } = require('../controllers/activity.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireProjectMember } = require('../middlewares/rbac.middleware');

router.get('/', authenticate, requireProjectMember, getProjectActivity);

module.exports = router;
