const mongoose = require("mongoose");

const PolicyCarrierSchema = new mongoose.Schema({
    company_name: { type: String }
});

module.exports = mongoose.model("policyCarrier", PolicyCarrierSchema);
