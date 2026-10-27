const { param } = require('express-validator');
const ExpenseModel = require('../../models/expense');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function viewExpense(req, res) {
    try {
        await param('expenseId').isMongoId().withMessage('Invalid Expense ID').run(req);
        if (rejectIfInvalid(req, res)) return;

        const expense = await ExpenseModel.findOne({ _id: req.params.expenseId, user: req.session.userId });
        if (!expense) {
            return sendError(res, { status: 404, message: 'Expense not found' });
        }

        return sendSuccess(res, { message: 'Expense fetched successfully', data: { expense } });
    } catch (error) {
        return sendServerError(res, error, 'An error occurred during opening the expense');
    }
}

module.exports = viewExpense;
