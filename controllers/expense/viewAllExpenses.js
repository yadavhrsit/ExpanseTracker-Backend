const { query } = require('express-validator');
const ExpenseModel = require('../../models/expense');
const { sendSuccess, rejectIfInvalid, sendServerError } = require('../../utils/response');

const sortCriteriaValues = ['date', 'category', 'amount'];

async function viewAllExpenses(req, res) {
    try {
        // toBoolean() rewrites req.query, so these flags are real booleans below
        await query('sort').optional().isBoolean().toBoolean().run(req);
        await query('sortingCriteria').optional().isIn(sortCriteriaValues).run(req);
        await query('filter').optional().isBoolean().toBoolean().run(req);
        await query('filterCriteria.date-range').optional().isString().run(req);
        await query('filterCriteria.category').optional().isString().run(req);
        await query('filterCriteria.amount-range').optional().isString().run(req);
        await query('paginate').optional().isBoolean().toBoolean().run(req);
        await query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit value').run(req);
        await query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number').run(req);
        if (rejectIfInvalid(req, res)) return;

        let expenseQuery = ExpenseModel.find({ user: req.session.userId });

        // Sorting
        if (req.query.sort === true && req.query.sortingCriteria) {
            expenseQuery = expenseQuery.sort({ [req.query.sortingCriteria]: 1 });
        }

        // Filtering
        if (req.query.filter === true && req.query.filterCriteria) {
            const filterCriteria = req.query.filterCriteria;

            if (filterCriteria['date-range']) {
                const [startDate, endDate] = filterCriteria['date-range'].split('-');
                expenseQuery = expenseQuery.where('date').gte(new Date(startDate)).lte(new Date(endDate));
            }

            if (filterCriteria.category) {
                expenseQuery = expenseQuery.where('category').equals(filterCriteria.category);
            }

            if (filterCriteria['amount-range']) {
                const [minAmount, maxAmount] = filterCriteria['amount-range'].split('-');
                expenseQuery = expenseQuery.where('amount').gte(parseInt(minAmount, 10)).lte(parseInt(maxAmount, 10));
            }
        }

        // Pagination
        if (req.query.paginate === true) {
            const limit = parseInt(req.query.limit, 10) || 10;
            const pageNum = parseInt(req.query.page, 10) || 1;

            const totalEntries = await ExpenseModel.countDocuments(expenseQuery.getFilter());
            const totalPages = Math.ceil(totalEntries / limit);

            const expenses = await expenseQuery.skip((pageNum - 1) * limit).limit(limit);

            return sendSuccess(res, {
                message: 'Expenses fetched successfully',
                data: {
                    expenses,
                    pagination: { currentPage: pageNum, totalPages, totalEntries, limit },
                },
            });
        }

        const expenses = await expenseQuery;
        return sendSuccess(res, { message: 'Expenses fetched successfully', data: { expenses } });
    } catch (error) {
        return sendServerError(res, error, 'An error occurred during getting all the expenses');
    }
}

module.exports = viewAllExpenses;
