const { param } = require('express-validator');
const BudgetModel = require('../../models/budget');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function viewBudget(req, res) {
    try {
        await param('budgetId').isMongoId().withMessage('Invalid Budget ID').run(req);
        if (rejectIfInvalid(req, res)) return;

        const budget = await BudgetModel.findOne({ _id: req.params.budgetId, user: req.session.userId });
        if (!budget) {
            return sendError(res, { status: 404, message: 'Budget not found' });
        }

        return sendSuccess(res, { message: 'Budget fetched successfully', data: { budget } });
    } catch (error) {
        return sendServerError(res, error, 'Failed to retrieve the budget');
    }
}

module.exports = viewBudget;
