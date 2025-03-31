const express = require("express");
const mongoose = require("mongoose");
const Agent = require("./models/agent.schema");
const User = require("./models/user.schema");
const UserAccount = require("./models/userAccount.schema");
const PolicyCategory = require("./models/policyCategory.schema");
const PolicyCarrier = require("./models/policyCarrier.schema");
const PolicyInfo = require("./models/policyInfo.schema");
const apiRouter = require('./routes/api');
require("dotenv").config();

const app = express();
app.use(express.json());
const cors = require("cors");
const startCronJob = require("./services/messageScheduler");
const checkCPUUsage = require("./services/cpuMonitor");

mongoose.connect("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to mongo database");
});

mongoose.connection.on("error", (err) => {
  console.log("Error at mongoDB: " + err);
});
mongoose.connection.once('open', () =>  {
   startCronJob()
   checkCPUUsage();
  });
app.use("/api",apiRouter );
app.use('/' , (req ,res) => {
    res.send("<h1>Welcome to InsureMind Backend</h1>")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`))

