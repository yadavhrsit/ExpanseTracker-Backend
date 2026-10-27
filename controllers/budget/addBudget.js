const { body } = require('express-validator');
const BudgetModel = require('../../models/budget');
const { sendSuccess, rejectIfInvalid, sendServerError } = require('../../utils/response');

async function addBudget(req, res) {
    try {
        await body('name').trim().notEmpty().withMessage('Name is required').run(req);
        await body('amount').notEmpty().withMessage('Amount is required').isNumeric().withMessage('Amount must be a number').run(req);
        if (rejectIfInvalid(req, res)) return;

        const { name, amount } = req.body;
        const user = req.session.userId;
        const budget = await new BudgetModel({ user, name, amount }).save();
        return sendSuccess(res, { status: 201, message: 'Budget added successfully', data: { budget } });
    } catch (err) {
        return sendServerError(res, err, 'An error occurred during the addition of the budget');
    }
}

module.exports = addBudget;
