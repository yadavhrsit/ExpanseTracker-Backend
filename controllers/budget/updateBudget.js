const { body } = require('express-validator');
const BudgetModel = require('../../models/budget');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function updateBudget(req, res) {
    try {
        await body('id').notEmpty().withMessage('Budget ID is required').isMongoId().withMessage('Invalid Budget ID').run(req);
        await body('amount').notEmpty().withMessage('Amount is required').isNumeric().withMessage('Amount must be a number').run(req);
        if (rejectIfInvalid(req, res)) return;

        const { id, amount } = req.body;

        const budget = await BudgetModel.findOne({ _id: id, user: req.session.userId });
        if (!budget) {
            return sendError(res, { status: 404, message: 'Budget not found' });
        }

        budget.amount = amount;
        await budget.save();

        return sendSuccess(res, { message: 'Budget updated successfully', data: { budget } });
    } catch (err) {
        return sendServerError(res, err, 'An error occurred during the update of the budget');
    }
}

module.exports = updateBudget;
