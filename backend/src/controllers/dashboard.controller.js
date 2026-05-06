const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
