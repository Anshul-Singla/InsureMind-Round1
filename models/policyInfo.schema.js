const mongoose = require("mongoose");

const PolicyInfoSchema = new mongoose.Schema({
    policy_number: { type: String},
    policy_start_date: { type: Date },
    policy_end_date: { type: Date },
    policy_category: { type: mongoose.Schema.Types.ObjectId, ref: "policyCategory" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "policyCarrier" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("policyInfo", PolicyInfoSchema);
