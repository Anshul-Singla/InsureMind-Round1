const express = require("express");
const Policy = require("../models/policyInfo.schema");
const User = require("../models/user.schema");

const router = express.Router();

router.get("/search", async (req, res) => {
    console.log('req.query:', req.query)
    const {username} = req.query
    try {
        const user = await User.findOne({ firstname: username });    
        if (!user) return res.status(404).json({ error: "User not found" });

        const policies = await Policy.find({ user_id: user._id })
        .populate([ "company" , "user_id" ,"policy_category"]);
        res.json(policies);
    } catch (error) {
        res.status(500).json({ policyError: error.message });
    }
});


router.get("/", async (req, res) => {
    console.log('-------req:---------')
    try {
        const result = await Policy.aggregate([
            { $group: { _id: "$user_id", totalPolicies: { $sum: 1 } } },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { _id: 0, user: "$user.firstname", totalPolicies: 1 } }
        ]);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
