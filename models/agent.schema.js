const mongoose = require("mongoose");

const AgentSchema = new mongoose.Schema({
    agent_name: { type: String}
});

module.exports = mongoose.model("agent", AgentSchema);
