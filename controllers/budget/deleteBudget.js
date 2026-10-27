const { body } = require('express-validator');
const BudgetModel = require('../../models/budget');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function deleteBudget(req, res) {
    try {
        await body('id').notEmpty().withMessage('Budget ID is required').isMongoId().withMessage('Invalid Budget ID').run(req);
        if (rejectIfInvalid(req, res)) return;

        const { id } = req.body;
        const deletedBudget = await BudgetModel.findOneAndDelete({ _id: id, user: req.session.userId });
        if (!deletedBudget) {
            return sendError(res, { status: 404, message: 'Budget not found' });
        }
        return sendSuccess(res, { message: 'Budget deleted successfully' });
    } catch (error) {
        return sendServerError(res, error, 'Failed to delete the budget');
    }
}

module.exports = deleteBudget;
