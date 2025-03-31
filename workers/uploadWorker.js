const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const mongoose = require("mongoose");

const Agent = require("../models/agent.schema");
const User = require("../models/user.schema");
const UserAccount = require("../models/userAccount.schema");
const PolicyCategory = require("../models/policyCategory.schema");
const PolicyCarrier = require("../models/policyCarrier.schema");
const PolicyInfo = require("../models/policyInfo.schema");


mongoose.connect("mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function processCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
}

async function processXLSX(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return sheet;
}

function normalizeKeys(row) {
    const newRow = {};
    for (const key in row) {
        const normalizedKey = key.replace(/^\uFEFF/, "").trim();
        newRow[normalizedKey] = row[key];
    }
    return newRow;
}


// const parseDate = (dateStr) => {
//     if (!dateStr || dateStr.trim() === "") return null; // Handle empty dates
//     const [month, day, year] = dateStr.split("/").map(Number);
//     return new Date(year, month - 1, day); // Ensure correct date format
// };

// const parseDOB = (dobString) => {
//     console.log('dobString:', dobString)
//     const parts = dobString.split('/');
//     if (parts.length === 3) {
//         let month = parseInt(parts[0], 10) - 1;  // Month is 0-based in JS
//         let day = parseInt(parts[1], 10);
//         let year = parseInt(parts[2], 10);

//         // Handle 2-digit years (assume 1930-2029 range)
//         year += year < 30 ? 2000 : 1900; 

//         let temp =  new Date(year, month, day);
//         console.log('temp:', temp)
//         return temp
//     }
//     return null; // Return null if parsing fails
// };

async function saveToDatabase(rows) {
    const insertedUsers = {};
    const insertedAgents = {};
    const insertedCompanies = {}; 
    const insertedCategories = {};
    const insertedAccounts = {};

    for (let row of rows) {
        row = normalizeKeys(row);
        // console.log('row.agent:', row.agent);
        // console.log('row:', row)
        try {
            let agent = insertedAgents[row.agent];
            if (!agent) {
                agent = await Agent.findOneAndUpdate(
                    { agent_name: row.agent },
                    { agent_name: row.agent },
                    { upsert: true, new: true }
                );
                insertedAgents[row.agent] = agent;
            }
 
            // Insert Policy Carrier (Company)
            let company = insertedCompanies[row.company_name];
            if (!company) {
                company = await PolicyCarrier.findOneAndUpdate(
                    { company_name: row.company_name },
                    { company_name: row.company_name },
                    { upsert: true, new: true }
                );
                insertedCompanies[row.company_name] = company;
            }

            // Insert Policy Category
            let category = insertedCategories[row.category_name];
            if (!category) {
                category = await PolicyCategory.findOneAndUpdate(
                    { category_name: row.category_name },
                    { category_name: row.category_name },
                    { upsert: true, new: true }
                );
                insertedCategories[row.category_name] = category;
            }

            // Insert User
            let user = insertedUsers[row.firstname];
            // console.log('row:', row.dob)
            if (!user) {
                user = await User.findOneAndUpdate(
                    { firstname: row.firstname },
                    {
                        firstname: row.firstname,
                        DOB: row.dob,
                        address: row.address,
                        phone_number: row.phone,
                        state: row.state,
                        zip_code: row.zip,
                        email: row.email,
                        gender: row.gender,
                        userType: row.userType,
                    },
                    { upsert: true, new: true }
                  );
                insertedUsers[row.email] = user;
            }

            // Insert User Account
            let account = insertedAccounts[row.account_name];
            if (!account) {
                account = await UserAccount.findOneAndUpdate(
                    { account_name: row.account_name},
                    { account_name: row.account_name},
                    { upsert: true, new: true }
                );
                insertedAccounts[row.account_name] = account;
            }
            await PolicyInfo.findOneAndUpdate(
                { policy_number: row.policy_number },
                {
                    policy_number: row.policy_number,
                    policy_start_date:row.policy_start_date,
                    policy_end_date: row.policy_end_date,
                    policy_category: category._id,
                    company: company._id,
                    user_id: user._id,
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error("Error processing row:", error);
        }
    }
}



(async () => {
    try {
        const { filePath, fileType } = workerData;
        let rows = [];

        if (fileType === "csv") {
            rows = await processCSV(filePath);
        } else if (fileType === "xlsx") {
            rows = await processXLSX(filePath);
        } else {
            throw new Error("Unsupported file type");
        }

        const chunkSize = 25;
        let chunkNumber = 0;

        for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize);
            chunkNumber++;
            await Promise.all(chunk.map(row => saveToDatabase([row])));
        }
        parentPort.postMessage({ success: true, message: "File processed successfully" });
        fs.unlinkSync(filePath); // Delete uploaded file
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
})();
