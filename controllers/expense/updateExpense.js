const { check } = require('express-validator');
const mongoose = require('mongoose');
const ExpenseModel = require('../../models/expense');
const BudgetModel = require('../../models/budget');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function updateExpense(req, res) {
    await check('expenseId').notEmpty().withMessage('Expense ID is required').isMongoId().withMessage('Invalid Expense ID').run(req);
    await check('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number').run(req);
    await check('budgetId').optional().isMongoId().withMessage('Invalid Budget ID').run(req);
    await check('description')
        .optional()
        .custom((value) => {
            const wordCount = String(value).trim().split(/\s+/).length;
            if (wordCount > 100) {
                throw new Error('Description should be maximum 100 words');
            }
            return true;
        })
        .run(req);
    if (rejectIfInvalid(req, res)) return;

    const { expenseId, description, budgetId } = req.body;
    const user = req.session.userId;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const expense = await ExpenseModel.findOne({ _id: expenseId, user }).session(session);
        if (!expense) {
            await session.abortTransaction();
            return sendError(res, { status: 404, message: 'Expense not found' });
        }

        const targetBudgetId = budgetId || expense.budgetId;
        const newAmount = req.body.amount != null ? Number(req.body.amount) : expense.amount;
        const budgetChanged = String(targetBudgetId) !== String(expense.budgetId);

        if (budgetChanged || newAmount !== expense.amount) {
            const budget = await BudgetModel.findOne({ _id: targetBudgetId, user }).session(session);
            if (!budget) {
                await session.abortTransaction();
                return sendError(res, { status: 404, message: 'Budget not found' });
            }

            const otherExpenses = await ExpenseModel.find({ budgetId: targetBudgetId, _id: { $ne: expense._id } }).session(session);
            const otherTotal = otherExpenses.reduce((total, e) => total + e.amount, 0);
            if (budget.amount - otherTotal < newAmount) {
                await session.abortTransaction();
                return sendError(res, { status: 400, message: 'Expense exceeds the budget' });
            }

            expense.amount = newAmount;
            if (budgetChanged) {
                expense.budgetId = targetBudgetId;
                expense.category = budget.name;
            }
        }

        if (description != null) {
            expense.description = description;
        }

        await expense.save({ session });
        await session.commitTransaction();

        return sendSuccess(res, { message: 'Expense updated successfully', data: { expense } });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        return sendServerError(res, error, 'An error occurred during updating the expense');
    } finally {
        await session.endSession();
    }
}

module.exports = updateExpense;
