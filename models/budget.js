const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Budget = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
});
const budgetModel = mongoose.model('Budget', Budget);

module.exports = budgetModel;
