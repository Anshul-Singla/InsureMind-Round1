const mongoose = require("mongoose");

const PolicyCategorySchema = new mongoose.Schema({
    category_name: { type: String}
});

module.exports = mongoose.model("policyCategory", PolicyCategorySchema);
