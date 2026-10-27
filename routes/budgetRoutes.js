const express = require('express');
const Router = express.Router();

const addBudget = require('../controllers/budget/addBudget');
const updateBudget = require('../controllers/budget/updateBudget');
const deleteBudget = require('../controllers/budget/deleteBudget');
const viewAllBudgets = require('../controllers/budget/viewAllBudgets');
const viewBudget = require('../controllers/budget/viewBudget');

const isAuthorized = require('../middlewares/isAuthenticated');

Router.post('/add', isAuthorized, addBudget);
Router.patch('/update', isAuthorized, updateBudget);
Router.delete('/delete', isAuthorized, deleteBudget);
Router.get('/viewall', isAuthorized, viewAllBudgets);
Router.get('/view/:budgetId',isAuthorized, viewBudget);

module.exports = Router;