const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstname: { type: String},
    dob: { type: Date},
    address: { type: String},
    phone: { type: String},
    state: { type: String},
    zip: { type: String},
    email: { type: String},
    gender: { type: String},
    userType: { type: String}
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
