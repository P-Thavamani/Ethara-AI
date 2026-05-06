const router = require('express').Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, getDashboard);

module.exports = router;
