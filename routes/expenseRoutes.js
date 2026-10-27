const express = require('express');
const Router = express.Router();

const addExpense = require('../controllers/expense/addExpense');
const updateExpense = require('../controllers/expense/updateExpense');
const deleteExpense = require('../controllers/expense/deleteExpense');
const viewAllExpenses = require('../controllers/expense/viewAllExpenses');
const viewExpense = require('../controllers/expense/viewExpense');

const isAuthorized = require('../middlewares/isAuthenticated');

Router.post('/add', isAuthorized, addExpense);
Router.patch('/update', isAuthorized, updateExpense);
Router.delete('/delete', isAuthorized, deleteExpense);
Router.get('/viewall', isAuthorized, viewAllExpenses);
Router.get('/view/:expenseId',isAuthorized, viewExpense);

module.exports = Router;