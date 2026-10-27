const { query } = require('express-validator');
const BudgetModel = require('../../models/budget');
const { sendSuccess, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function viewAllBudgets(req, res) {
    try {
        await query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number').toInt().run(req);
        await query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit value').toInt().run(req);
        if (rejectIfInvalid(req, res)) return;

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const budgets = await BudgetModel.find({ user: req.session.userId }).skip(skip).limit(limit);
        return sendSuccess(res, { message: 'Budgets fetched successfully', data: { budgets } });
    } catch (error) {
        return sendServerError(res, error, 'An error occurred while retrieving all the budgets');
    }
}

module.exports = viewAllBudgets;
