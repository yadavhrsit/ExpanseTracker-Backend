const { check } = require('express-validator');
const mongoose = require('mongoose');
const ExpenseModel = require('../../models/expense');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function deleteExpense(req, res) {
    await check('expenseId').notEmpty().withMessage('Expense ID is required').isMongoId().withMessage('Invalid Expense ID').run(req);
    if (rejectIfInvalid(req, res)) return;

    const { expenseId } = req.body;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const deleted = await ExpenseModel.findOneAndDelete({ _id: expenseId, user: req.session.userId }).session(session);
        if (!deleted) {
            await session.abortTransaction();
            return sendError(res, { status: 404, message: 'Expense not found' });
        }

        await session.commitTransaction();
        return sendSuccess(res, { message: 'Expense deleted successfully' });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        return sendServerError(res, error, 'An error occurred during deleting the expense');
    } finally {
        await session.endSession();
    }
}

module.exports = deleteExpense;
