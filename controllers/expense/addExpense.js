const { check } = require('express-validator');
const mongoose = require('mongoose');
const BudgetModel = require('../../models/budget');
const ExpenseModel = require('../../models/expense');
const { sendSuccess, sendError, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function addExpense(req, res) {
    await check('description').trim().notEmpty().withMessage('Description is required').run(req);
    await check('amount').notEmpty().withMessage('Amount is required').isFloat({ gt: 0 }).withMessage('Amount must be a positive number').run(req);
    await check('budgetId').notEmpty().withMessage('Budget ID is required').isMongoId().withMessage('Invalid Budget ID').run(req);
    if (rejectIfInvalid(req, res)) return;

    const { description, budgetId } = req.body;
    const amount = Number(req.body.amount);
    const user = req.session.userId;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const budget = await BudgetModel.findOne({ _id: budgetId, user }).session(session);
        if (!budget) {
            await session.abortTransaction();
            return sendError(res, { status: 404, message: 'Budget not found' });
        }

        const allExpensesInBudget = await ExpenseModel.find({ budgetId }).session(session);
        const cumulativeTotal = allExpensesInBudget.reduce((total, expense) => total + expense.amount, 0);

        if (budget.amount - cumulativeTotal < amount) {
            await session.abortTransaction();
            return sendError(res, { status: 400, message: 'Expense exceeds the budget' });
        }

        const newExpense = new ExpenseModel({
            description,
            amount,
            budgetId,
            user,
            category: budget.name,
        });
        await newExpense.save({ session });

        await session.commitTransaction();
        return sendSuccess(res, { status: 201, message: 'Expense added successfully', data: { expense: newExpense } });
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        return sendServerError(res, error, 'An error occurred during the addition of the expense');
    } finally {
        await session.endSession();
    }
}

module.exports = addExpense;
