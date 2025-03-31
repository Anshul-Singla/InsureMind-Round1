const express = require("express")
const uploadRoute = require("./upload")
const policyRouter =  require("./policy")
const scheduleRouter = require("./schedule")

const app = express();
app.use("/upload"  , uploadRoute );
app.use("/policy"  , policyRouter);
app.use("/schedule", scheduleRouter);

module.exports = app;  